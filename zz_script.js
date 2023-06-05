let users = [
    { name: 'John', age: 25, occupation: 'gardener' },
    { name: 'Lenny', age: 51, occupation: 'programmer' },
    { name: 'Andrew', age: 43, occupation: 'teacher' },
    { name: 'Peter', age: 81, occupation: 'teacher' },
    { name: 'Anna', age: 47, occupation: 'programmer' },
    { name: 'Albert', age: 76, occupation: 'programmer' },
]

let filteredUsers = users.filter((user) => {
    return user.age > 40 && user.occupation === 'programmer';
});
// console.log(filteredUsers);

let data = [
    {
        "description": "Vodacom",
        "network": "vodacom",
        "costprice": 248.88,
        "sellprice": 275,
        "groupname": "Airtime Voucher"
    },
    {
        "description": "Vodacom",
        "network": "vodacom",
        "costprice": 995.5,
        "sellprice": 1100,
        "groupname": "Airtime Voucher"
    },
    {
        "description": "WorldCall",
        "network": "worldcall",
        "costprice": 9.05,
        "sellprice": 10,
        "groupname": "Airtime Voucher"
    }
]

let filteredData = data.filter((item) => {
    return item.network === 'vodacom';
});

console.log(filteredData);