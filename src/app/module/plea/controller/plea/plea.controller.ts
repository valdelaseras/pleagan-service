import {
  BadRequestException,
  Body, ConflictException,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { SupportService } from '../../../support/service/support/support.service';
import { PleaganService } from '../../../pleagan/service/pleagan/pleagan.service';
import { QueryFailedError } from 'typeorm';
import { LoggerService } from '../../../shared/service/logger/logger.service';
import { ProductService } from '../../../product/service/product/product.service';
import { CompanyService } from '../../../company/service/company/company.service';
import { MessagingService } from '../../../shared/service/messaging/messaging.service';
import { PushService } from '../../../shared/service/messaging/push.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InboxService } from '../../../inbox/service/inbox/inbox.service';
import {
  CreateCommentDto,
  CreatePleaDto,
  Device,
  GetPleaDto,
  Plea,
  PLEA_TARGET,
  UpdatePleaDto
} from '../../../../model';
import { OrderByOptions, PleaQueryOptions, PleaService, SortDirection } from '../../service/plea/plea.service';

export interface PleaQueryParams {
  companyName?: string;
  productName?: string;
  orderBy?: OrderByOptions;
  direction?: SortDirection;
  search?: string;
}

@ApiTags( 'plea' )
@Controller('plea')
export class PleaController {
  constructor(
      private pleaService: PleaService,
      private supportService: SupportService,
      private productService: ProductService,
      private companyService: CompanyService,
      private pleaganService: PleaganService,
      private inboxService: InboxService,
      private messagingService: MessagingService,
      private pushService: PushService
  ) {}

  // @ApiOperation({ summary: 'Get all pleas.' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Success.',
  //   isArray: true,
  //   type: () => GetPleaDto
  // })
  // @Get('all')
  // getAllPleas( @Req() request: Request ): Promise<Plea[]> {
  //   return this.pleaService.getAllPleas( request[ 'firebaseUser' ]?.uid );
  // }

  @ApiOperation({ summary: 'Get all pleas to a company.' })
  @ApiResponse({
    status: 200,
    description: 'Success.',
    isArray: true,
    type: () => GetPleaDto
  })
  @Get('company/:companyId')
  getAllPleasToCompany(
      @Param('companyId') companyId: number,
      @Req() request: Request
  ): Promise<Plea[]> {
    return this.pleaService.getAllPleasToCompany( companyId, request[ 'firebaseUser' ]?.uid );
  }

  @ApiOperation({ summary: 'Get pleas I have created.' })
  @ApiResponse({
    status: 200,
    description: 'Success.',
    isArray: true,
    type: () => GetPleaDto
  })
  @ApiBearerAuth()
  @Get('my-pleas')
  getPleasFromCurrentUser( @Req() request: Request ): Promise<Plea[]> {
    return this.pleaService.getPleasFromCurrentUser( request[ 'firebaseUser' ].uid );
  }

  @ApiOperation({ summary: 'Get pleas I have supported.' })
  @ApiResponse({
    status: 200,
    description: 'Success.',
    isArray: true,
    type: () => GetPleaDto
  })
  @ApiBearerAuth()
  @Get('my-supported-pleas')
  getSupportedPleasByPleagan( @Req() request: Request ): Promise<Plea[]> {
    return this.pleaService.getSupportedPleasByPleagan( request[ 'firebaseUser' ].uid );
  }

  @ApiOperation({ summary: 'Get a plea.' })
  @ApiResponse({
    status: 200,
    description: 'Success.',
    type: () => GetPleaDto
  })
  @ApiResponse({
    status: 404,
    description: 'No plea by this id could be found.'
  })
  @Get(':id')
  getPleaById( @Param('id') id: number ): Promise<Plea> {
    return this.pleaService.getPleaById( id );
  }

  @ApiOperation({ summary: 'Search for pleas.' })
  @ApiResponse({
    status: 200,
    description: 'Success.',
    isArray: true,
    type: () => GetPleaDto
  })
  @Get()
  searchPleas(
      @Req() request: Request,
      @Query() params?: PleaQueryParams
   ): Promise<Plea[]> {
    return this.pleaService.searchPleas(
        this.parseQueryParams( params )
    );
  }

  @ApiOperation({ summary: 'Create a new plea.' })
  @ApiResponse({
    status: 200,
    description: 'Success.',
    type: () => GetPleaDto
  })
  @ApiResponse({
    status: 409,
    description: 'Product with name ${ name } is already assigned to a plea.'
  })
  @ApiBearerAuth()
  @Post()
  async addPlea(
      @Body() plea: CreatePleaDto,
      @Req() request: Request,
  ): Promise<Plea> {
    // Create and save a new product
    const nonVeganProduct = await this.productService.createProduct(
        plea.nonVeganProduct.name,
        false,
        plea.nonVeganProduct.imageUrl
    );

    // Retrieve pleagan entity of user that initiated this plea
    const pleagan = await this.pleaganService.getFullPleaganByUid( request[ 'firebaseUser' ].uid );

    // Get company if it is known, create and save if it isn't
    const company = await this.companyService.getOrAddCompany( plea.company.name );

    // Create and save a new plea
    return await this.pleaService.addPlea( plea.description, company, pleagan, nonVeganProduct );
  }

  @ApiOperation({ summary: 'Support a plea.' })
  @ApiResponse({
    status: 200,
    description: 'Success.'
  })
  @ApiResponse({
    status: 400,
    description: 'You can\'t support a plea you initiated.'
  })
  @ApiResponse({
    status: 409,
    description: 'You have already supported this plea.'
  })
  @ApiBearerAuth()
  @Post( ':id/support' )
  async supportPlea(
      @Param('id') id: number,
      @Body() { comment }: CreateCommentDto,
      @Req() request: Request
  ): Promise<void> {
    const plea = await this.pleaService.getPleaById( id );
    const pleaganUid = request[ 'firebaseUser' ].uid;

    if ( pleaganUid === plea.pleagan.uid ) {
      throw new BadRequestException(`You can't support a plea you initiated.`);
    }

    const pleagan = await this.pleaganService.getPleaganByUid( pleaganUid );
    const support = await this.supportService.createSupport( comment );

    try {
      // We don't want to make the supporter wait, so do not wait for this method to finish
      this.resolveNotificationsOnSupport( plea );

      return await this.supportService.addSupport( support, plea, pleagan );
    } catch( exception ) {
      console.trace( exception );
      switch( exception.constructor ) {
        case QueryFailedError:
          if ( exception.message.indexOf( 'Duplicate' ) >= 0 ) {
            throw new ConflictException( 'You have already supported this plea.' );
          }
        default:
          LoggerService.error( exception );
      }
    }
  }

  @ApiOperation({ summary: 'Update a plea.' })
  @ApiResponse({
    status: 200,
    description: 'Success.'
  })
  @ApiBearerAuth()
  @Put( ':id' )
  async updatePlea(
      @Param('id') id: number,
      @Body() plea: UpdatePleaDto,
      @Req() request: Request
  ): Promise<void> {
    await this.pleaService.updatePlea( id, plea, request[ 'firebaseUser' ].uid );
  }

  // @TODO: re-enable later
  // @Post(':id/vegan-product')
  // async addVeganProduct(@Param('id') id, @Body() product: IProduct): Promise<void> {
  //   await this.pleaService.addVeganProduct(id, product);
  //   return;
  // }

  private parseQueryParams( params: PleaQueryParams ): PleaQueryOptions {
    const {
      search,
      companyName,
      productName,
      orderBy,
      direction
    } = params;

    const parsedParams = {
      companyName,
      productName,
      orderBy,
      direction
    };

    if ( search ) {
      if ( search.indexOf(' ') !== -1 ) {
        for (const fragment of search.split(' ')) {
          if (this.productService.isKnownProduct(fragment)) {
            parsedParams.productName = fragment;
          }

          if (this.companyService.isKnownCompany(fragment)) {
            parsedParams.companyName = fragment;
          }
        }
      } else {
        parsedParams.productName = search;
        parsedParams.companyName = search;
      }
    }

    return parsedParams;
  }

  private getCardinality( index: number ): string {
    switch ( index ) {
      case 0:
        return 'first';
      case 1:
        return 'second';
      case 2:
        return 'third';
    }
  }

  private getTargetReachedText( index: number, productName: string, numberOfSupports: number, recipientIsOwner: boolean ): string {
    const header = 'Dear pleagan,\n\n';
    const body = `${ recipientIsOwner ? 'Your' : 'The' } plea for ${ productName } has reached its ${ index.toCardinal() } target of ${ numberOfSupports } supporters!\n`;
    const footer = `\nWe will keep you notified of any changes in ${ productName }'s status.\n\nKind regards,\n\nTeam Pleagan`;
    switch ( index ) {
      case 0:
        return `${ header }${ body }This means that the Pleagan team will contact the supplier to let them know how happy it would make you if they released a vegan version of ${ productName }.${ footer }`;
      case 1:
        return `${ header }${ body }This means that the pleagan team will contact the supplier again and share with them the increased support for a vegan version of ${ productName }.${ footer }`;
      case 2:
        return `${ header }${ body }This means that the pleagan team will once more contact the supplier to inform them of the overwhelming support a vegan version of ${ productName } enjoys.${ footer }`;
    }
  }

  private async resolveNotificationsOnSupport( plea: Plea ): Promise<void> {
    // Count total number of supports the plea now has
    return this.pleaService.getNumberOfSupportsByPleaId( plea.id ).then( async ( numberOfSupports: number) => {

      const threshold = SupportService.NOTIFICATION_THRESHOLDS.find( n => n === numberOfSupports );
      const targetIndex = Object.values( PLEA_TARGET ).findIndex( n => n === numberOfSupports );
      let messageToOwner = null;
      let messageToSupporters = null;

      let owner;
      const supporters = [];

      if ( targetIndex || threshold ) {
        // Only retrieve owner when necessary
        owner = await this.inboxService.getInboxForPleagan( plea.pleagan.uid );
      }

      if ( targetIndex ) {
        // The plea has hit its (next) target, notify the owner, company and supporters
        // Construct a messageToOwner to the pleagan that created this plea
        messageToOwner = {
          subject: `Target of ${ numberOfSupports } supports achieved`,
          text: this.getTargetReachedText( targetIndex, plea.nonVeganProduct.name, numberOfSupports, true ),
          url: `https://pleagan.vg/plea/${ plea.id }/details`,
        };

        // Notify supporters
        supporters.push( ...(await this.inboxService.getInboxForSupporters( plea.id )) );
        if ( supporters.length ) {
          // Construct a messageToOwner to supporters if any are found
          messageToSupporters = {
            subject: messageToOwner.subject,
            url: messageToOwner.url,
            text: this.getTargetReachedText( targetIndex, plea.nonVeganProduct.name, numberOfSupports, false ),
          };
        }

        // Notify companies
        // @TODO: implement

      } else if ( threshold ) {
        // This plea has reached a threshold in the number of supporters. Notify its owner
        // Construct a messageToOwner to the pleagan that created this plea
        messageToOwner = {
          subject: `Your plea has reached ${ numberOfSupports } supporters`,
          text: `Your plea for ${ plea.nonVeganProduct.name } has reached ${ threshold } supporters!\n`,
          url: `https://pleagan.vg/plea/${ plea.id }/details`,
        };
      }

      if ( messageToOwner ) {
        // Fire and forget messageToOwner into inbox
        this.messagingService.sendMessageToPleagans(
            [ owner ],
            messageToOwner.subject, messageToOwner.text, messageToOwner.url
        );

        // Get a list of devices that are eligible for a push notification
        const devices = owner.devices.filter( ( device: Device ) => device.notifyOnMyPleas );
        if ( devices.length ) {
          // Fire and forget push notifications
          this.pushService.sendPushNotificationToDevices( devices.map( ({ token }) => token ), messageToOwner.subject, messageToOwner.text );
        }
      }

      if ( messageToSupporters ) {
        this.messagingService.sendMessageToPleagans(
            supporters,
            messageToSupporters.subject, messageToSupporters.text, messageToSupporters.url
        );

        // Get a list of devices that are eligible for a push notification and flatten it
        const devices = [];
        supporters.forEach( supporter => devices.push( ...supporter.devices.filter( ( device: Device ) => device.notifyOnSupportedPleas ) ));

        if ( devices.length ) {
          // Fire and forget push notifications
          this.pushService.sendPushNotificationToDevices( devices.map( ({ token }) => token ), messageToSupporters.subject, messageToSupporters.text );
        }
      }
    })
  }
}
