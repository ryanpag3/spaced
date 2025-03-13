export class CreateMediaDto {
    readonly name: string;
    readonly description: string;
    readonly file: any;

    constructor(name: string, description: string, file: any) {
        this.name = name;
        this.description = description;
        this.file = file;
    }
}