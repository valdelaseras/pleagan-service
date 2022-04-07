interface Number {
    toCardinal(): string;
}

Number.prototype.toCardinal = function() {
    switch ( this ) {
        case 0:
            return 'first';
        case 1:
            return 'second';
        case 2:
            return 'third';
    }
}
