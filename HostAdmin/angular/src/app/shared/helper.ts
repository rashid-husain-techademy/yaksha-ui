import { HttpParams } from "@angular/common/http";
import { Constants } from "@app/models/constants";

export interface NgbDate {
    year: number;
    month: number;
    day: number;
}

export class Helper {
    static secondsToHm(value: number) {
        let seconds = Number(value);
        let hour = Math.floor(seconds / 3600).toString().padStart(2, '0');
        let minutes = Math.floor(seconds % 3600 / 60).toString().padStart(2, '0');
        let sec = Math.floor(seconds % 60).toString().padStart(2, '0');
        if (parseFloat(hour))
            return `${hour}h ${minutes}m ${sec}s`;
        else
            return `${minutes}m ${sec}s`;
    }

    static sortString<T>(value: string) {
        return function (a: T, b: T) {
            const aValue = a[value].toLowerCase();
            const bValue = b[value].toLowerCase();
            if (aValue > bValue) return 1;
            if (aValue < bValue) return -1;
            return 0;
        };
    }

    static sortNumber(value: string) {
        return function (a: number, b: number) {
            if (a[value] > b[value]) return 1;
            if (a[value] < b[value]) return -1;
            return 0;
        };
    }
    static sortNumberDecending<T>(value: string) {
        return function (a: T, b: T) {
            if (a[value] > b[value]) return -1;
            if (a[value] < b[value]) return 1;
            return 0;
        };
    }

    static convertNgbDateToString(date: NgbDate, time: string) {
        if (date && time)
            return `${date.year}-${date.month}-${date.day} ${time}`;
        else if (date)
            return `${date.year}-${date.month}-${date.day}`;
        else
            return "";
    }

    static convertUTCDateToLocalDate(dateString: string): Date {
        if (dateString) {
            var utcDate = new Date(dateString.split('+')[0]);
            return new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60 * 1000);
        }
        return null;
    }

    static getTimeZone() {
        if (/\((.*)\)/.exec(new Date().toString())[1] == 'Gulf Standard Time')
            return Constants.arabianStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Philippine Standard Time')
            return Constants.singaporeStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'GMT-12:00')
            return Constants.datelineStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'GMT-11:00')
            return Constants.utc11;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Hawaii-Aleutian Daylight Time')
            return Constants.aleutianStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Hawaii-Aleutian Standard Time')
            return Constants.hawaiianStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Marquesas Time')
            return Constants.marquesasStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Alaska Daylight Time' || /\((.*)\)/.exec(new Date().toString())[1] == 'Alaska Standard Time')
            return Constants.alaskanStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'GMT-09:00')
            return Constants.utc09;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Mexican Pacific Daylight Time' || /\((.*)\)/.exec(new Date().toString())[1] == 'Mexican Pacific Standard Time')
            return Constants.mountainStandardTimeMexico;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Yukon Time')
            return Constants.yukonStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Easter Island Summer Time')
            return Constants.easterIslandStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Colombia Standard Time' || /\((.*)\)/.exec(new Date().toString())[1] == 'Colombia Daylight Time')
            return Constants.saPacificStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Venezuela Time')
            return Constants.venezuelaStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Amazon Standard Time')
            return Constants.centralBrazilianStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Bolivia Time')
            return Constants.saWesternStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Chile Summer Time')
            return Constants.pacificSAStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Brasilia Standard Time')
            return Constants.tocantinsStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'French Guiana Time')
            return Constants.saEasternStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'West Greenland Summer Time')
            return Constants.greenlandStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Uruguay Standard Time')
            return Constants.montevideoStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'GMT-03:00')
            return Constants.magallanesStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'St. Pierre & Miquelon Daylight Time' || /\((.*)\)/.exec(new Date().toString())[1] == 'St. Pierre & Miquelon Standard Time')
            return Constants.saintpierreStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'GMT-02:00')
            return Constants.utc02;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Azores Summer Time')
            return Constants.azoresStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Coordinated Universal Time')
            return Constants.utc;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Australian Eastern Standard Time')
            return Constants.eAustraliaStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'British Summer Time')
            return Constants.gmtStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Greenwich Mean Time')
            return Constants.greenwichStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'GMT+01:00')
            return Constants.moroccoStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Central European Summer Time')
            return Constants.wEuropeStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'West Africa Standard Time')
            return Constants.wCentralAfricaStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Eastern European Summer Time')
            return Constants.jordanStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Eastern European Standard Time')
            return Constants.egyptStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Israel Daylight Time')
            return Constants.israelStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Central Africa Time')
            return Constants.southSudanStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'GMT+03:00')
            return Constants.turkeyStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Moscow Standard Time')
            return Constants.belarusStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'East Africa Time')
            return Constants.eAfricaStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'GMT+04:00')
            return Constants.astrakhanStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Samara Standard Time')
            return Constants.russiaTimeZone3;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Georgia Standard Time')
            return Constants.georgianStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Armenia Standard Time')
            return Constants.caucasusStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Afghanistan Time')
            return Constants.afghanistanStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Uzbekistan Standard Time')
            return Constants.westAsiaStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Yekaterinburg Standard Time')
            return Constants.ekaterinburgStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == '中国标准时间')
            return Constants.chinaStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'West Kazakhstan Time')
            return Constants.qyzylordaStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Nepal Time')
            return Constants.nepalStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'East Kazakhstan Time')
            return Constants.centralAsiaStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Myanmar Time')
            return Constants.myanmarStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Indochina Time')
            return Constants.seAsiaStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'GMT+07:00')
            return Constants.altaiStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Hovd Standard Time')
            return Constants.wMongoliaStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Krasnoyarsk Standard Time')
            return Constants.northAsiaStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Novosibirsk Standard Time')
            return Constants.nCentralAsiaStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Irkutsk Standard Time')
            return Constants.northAsiaEastStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Australian Western Standard Time')
            return Constants.wAustraliaStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Australian Central Western Standard Time')
            return Constants.ausCentralWStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Japan Standard Time')
            return Constants.tokyoStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Korean Standard Time')
            return Constants.northKoreaStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Australian Central Standard Time')
            return Constants.cenAustraliaStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Papua New Guinea Time')
            return Constants.westPacificStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'GMT+11:00')
            return Constants.bougainvilleStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Norfolk Island Standard Time')
            return Constants.norfolkStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Solomon Islands Time')
            return Constants.centralPacificStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Petropavlovsk-Kamchatski Standard Time')
            return Constants.russiaTimeZone11;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'GMT+12:00')
            return Constants.utc12;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Chatham Standard Time')
            return Constants.chathamIslandsStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'GMT+13:00')
            return Constants.utc13;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Apia Standard Time')
            return Constants.samoaStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == 'Line Islands Time')
            return Constants.lineIslandsStandardTime;
        else if (/\((.*)\)/.exec(new Date().toString())[1] == '')
            return Constants.indiaStandardTime;
        else
            return /\((.*)\)/.exec(new Date().toString())[1];
    }

    static getFormattedDate(date) {
        let year = date.getFullYear();
        let month = (1 + date.getMonth()).toString().padStart(2, '0');
        let day = date.getDate().toString().padStart(2, '0');
        let hours = date.getHours().toString();
        let minutes = date.getMinutes().toString();
        let seconds = date.getSeconds().toString();
        return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
    }

    static stripHtml(html: string) {
        if (html) {
            var startParagraph = /\<p>/i;
            var remainingParagraph = /\<p>/gi;
            var breakTag = /\<br>/gi;
            var endParagraph = /\<\/p>/gi;
            var div = document.createElement("DIV");
            div.innerHTML = html.replace(startParagraph, "").replace(remainingParagraph, "\n").replace(endParagraph, "").replace(breakTag, "\n");
            let cleanText = div.innerText;
            div = null;
            return cleanText;
        }
        else
            return "";
    }

    static getStaticProfileImage(name, surname) {
        if (!surname) {
            surname = name?.slice(1, 2);
        }
        return (name?.slice(0, 1) + surname?.slice(0, 1)).toUpperCase();
    }

    static getChatDateAndTime(date) {
        date = this.convertUTCDateToLocalDate(date);
        if ((new Date().getDate() - new Date(date).getDate()) === 0)
            return new Date(date).toLocaleTimeString().replace(/:\d+ /, ' ');
        else if ((new Date().getDate() - new Date(date).getDate()) === 1)
            return "Yesterday";
        else if ((new Date().getDate() - new Date(date).getDate()) > 1)
            return new Date(date).toLocaleDateString();
    }

    static getFormattedTime(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let AmOrPm = hours >= 12 ? 'PM' : 'AM';
        hours = (hours % 12) || 12;
        hours = hours <= 9 ? `0${hours}` : hours;
        minutes = minutes < 30 ? "00" : "30";
        return `${hours}:${minutes} ${AmOrPm}`;
    }

    static httpParamBuilder(params: any): HttpParams {
        let httpParams = new HttpParams();
        if (params && Object.keys(params).length !== 0) {
            for (let key in params) {
                if (params[key] || params[key] === 0)
                    httpParams = httpParams.append(key, params[key]);
            }
            return httpParams;
        }
    }

    static emailValidation(emailAddress: string) {
        if (emailAddress !== "") {
            let emails = emailAddress.replace(/\s/g, '').split(",");
            let regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            for (let i = 0; i < emails.length; i++) {
                if (emails[i] === "" || !regex.test(emails[i])) {
                    return false;
                }
            }
            return true;
        }
    }

    static isHtml(questionText: string) {
        var doc = new DOMParser().parseFromString(questionText, "text/html");
        return Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
    }

    static isValidJson(answer: string) {
        try {
            JSON.parse(answer);
            return true;
        }
        catch (e) {
            return false;
        }
    }
}