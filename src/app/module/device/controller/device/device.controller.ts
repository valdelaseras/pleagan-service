import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { Device, GetDeviceDto } from '../../../../model/device';
import { DeviceService } from '../../service/device/device.service';
import { CreateDeviceDto } from '../../../../model/device';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags( 'device' )
@Controller('device')
export class DeviceController {
    constructor( private deviceService: DeviceService ) {}

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Register a new device.' })
    @ApiResponse({
        status: 200,
        description: 'Success.'
    })
    @Post('/')
    async addDevice(
        @Body() { token, uuid }: CreateDeviceDto,
        @Req() req: Request
    ): Promise<void> {
        return this.deviceService.addDevice( req['firebaseUser'].uid, token, uuid );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all devices the pleagan has registered.' })
    @ApiResponse({
        status: 200,
        description: 'Success.',
        isArray: true,
        type: () => GetDeviceDto
    })
    @Get('/')
    async getDevices(
        @Req() req: Request
    ): Promise<Device[]> {
        return this.deviceService.getDevicesByPleagan( req['firebaseUser'].uid );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remove an existing device.' })
    @ApiResponse({
        status: 200,
        description: 'Success.'
    })
    @Delete('/:uuid')
    async deleteDevice( @Param('uuid') uuid: string ): Promise<void> {
        return this.deviceService.deleteDevice( uuid );
    }
}
