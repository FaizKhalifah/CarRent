import process from "process";
import readlinePromises from "readline/promises";
import { MongoClient } from 'mongodb';

const input = readlinePromises.createInterface({
    input:process.stdin,
    output:process.stdout
})

async function main(){

}

const client = new MongoClient('mongodb://localhost:27017/CarRent');

async function fetchUser(){
    await client.connect();
    const db = client.db();
    let user = db.collection('User');
    return user;
}

async function fetchCar(){
    await client.connect();
    const db = client.db();
    let car = db.collection('Mobil');
    return car;
}

async function showUser(){
    const dataUser = await fetchUser();
    return (await dataUser.find().toArray());
}

async function showCar(){
    const dataMobil = await fetchCar();
    return (await dataMobil.find().toArray());
}

let tampilUser = await showUser();
console.log(tampilUser);
let tampilMobil = await showCar();
console.log(tampilMobil);