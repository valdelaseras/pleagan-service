export const emptyQueryParams = ( params: object ) => {
    let isEmpty = true;

    for ( const param of Object.values( params ) ) {
        if ( param !== '' && param !== undefined && param !== null ) {
            isEmpty = false;
        }
    }

    return isEmpty;
}
