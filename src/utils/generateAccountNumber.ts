export const generateAccountNumber = (accountNumbers: number[]) => {
    let accoutNumber: number = 1000000000 + Math.floor(Math.random() * 1000000000);

    while (accountNumbers.indexOf(accoutNumber) !== -1) {
        accoutNumber = 1000000000 + Math.floor(Math.random() * 1000000000);
    }

    return accoutNumber;
};