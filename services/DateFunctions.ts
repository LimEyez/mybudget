import { format } from "date-fns";

const getFormatedDate = (date: string | Date) => {
    if (typeof date === "string"){
        const [year, month, day] = date.split('-');
        return(`${day}.${month}.${year}`);
    } else if (date instanceof Date){
        return(format(date, 'dd.MM.yyyy'));
    };
    return "--.--.----";
}

export {getFormatedDate}