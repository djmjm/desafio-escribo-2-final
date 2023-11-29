class DateUtil {
    constructor(){}
    getDateNowYYYYMMDD_HHMMSS(){
        const date = new Date();
        return date.getUTCFullYear().toString() + "-" +
               (date.getUTCMonth() + 1).toString() + "-" +
               date.getUTCDate().toString() + "|" +
               date.getUTCHours().toString() + ":" + 
               date.getUTCMinutes().toString() + ":" + 
               date.getUTCSeconds().toString()
               ;
    }
}

module.exports=DateUtil;