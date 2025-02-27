
class LoaderTicketInfo {
    token: string;

    constructor() {
        this.token = "31342.z8N3gtXNO1RisxkKl";
    }

    async fetchRequestTicket(params : {t: string, s: string, fn: string, i: string, fp: string, n: string}){
        const url = "https://proverkacheka.com/api/v1/check/get";
        // const url = "https://prowqdwqqodwoqmdq.com/"
        const paramsWithToken = {...params, token: this.token};
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(paramsWithToken),
            });
            // console.log("response: ",response);
            const result = await response.json();
            if (result.code === 1) {
                // console.log("Чек успешно получен:", result.data);
                return result.data
            } else {
                return null
            }
        } catch(error) {
            // console.error("Ошибка при выполнении запроса:", error)
            return null
        }
    }

    async getParams(ticketInfo: string): Promise<any> {
        // ticketInfo = 't=&s=1975.34&fn=7380440700555593&i=9687&fp=2453014475&n=1'
        try {
            const params = Object.fromEntries(
                ticketInfo.split('&').map(str => str.split('='))
            );

            if (
                params.t == undefined || params.t == ''
                && params.s == undefined || params.s == ''
                && params.fn == undefined || params.fn == ''
                && params.i == undefined || params.i == ''
                && params.fp == undefined || params.fp == ''
                && params.n == undefined || params.n == ''
            ) {
                throw(new Error('Ошибка чтения QR (недостаточно информации)'))
            } else {
                const sortedParams = Object.fromEntries(Object.entries(params).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)))
                // return new Promise((resolve) => {
                //     setTimeout(() => resolve(null), 5000)
                // })
                return sortedParams
            }

        } catch (error) {
            console.error('Ошибка при обработке ticketInfo:', error); // Логируем ошибку
            return null; // Возвращаем null в случае ошибки
        }
    }
}

export { LoaderTicketInfo };
// t=20250214T2008&s=1975.34&fn=7380440700555593&i=9687&fp=2453014475&n=1