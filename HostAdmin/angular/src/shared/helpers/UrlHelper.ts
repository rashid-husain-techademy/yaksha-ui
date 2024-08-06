export class UrlHelper {
    /**
     * The URL requested, before initial routing.
     */
    static readonly initialUrl = location.href;

    static getQueryParameters(): any {
        return document.location.search
            .replace(/(^\?)/, '')
            .split('&')
            .map(function (n) { return n = n.split('='), this[n[0]] = n[1], this; }.bind({}))[0];
    }

    static isValidURL(assessmentUrl:string):boolean{
        let res = assessmentUrl.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        return (res !== null);
    }
}
