export class ResetPasswordDto {  
    newPassword: string;
    encodedUrl: string;
    
    constructor() {    
        this.newPassword = '';
        this.encodedUrl = '';
    }
}