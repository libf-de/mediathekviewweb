function io(variable) { return new iosocket(); }

class iosocket {
    disconnected = false;

    constructor() { }
    on(name, callback) { }
    emit(name, callback) { }
}