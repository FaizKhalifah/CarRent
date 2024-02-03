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

async function fetchInbox(){
    await client.connect();
    const db = client.db();
    let inbox = db.collection('inbox');
    return inbox;
}

async function showUser(){
    const dataUser = await fetchUser();
    return (await dataUser.find().toArray());
}

async function showCar(){
    const dataMobil = await fetchCar();
    return (await dataMobil.find().toArray());
}

async function showInbox(){
    const dataInbox = await fetchInbox();
    return (await dataInbox.find().toArray());
}

async function addUser(username,password){
    const dataUser = await fetchUser();
    await dataUser.insertOne({
        "nama":username,
        "password":password,
        "riwayat":[]
    })
    return "user telah ditambah";
}

async function addCar(merek,plat,keluaran){
    const dataMobil = await fetchCar();
    await dataMobil.insertOne({
        "merek":merek,
        "plat":plat,
        "keluaran":keluaran,
        "status":"tersedia"
    })
    return "mobil berhasil ditambah ke stok"
}

async function addInbox(body,username){
    const dataInbox = await fetchInbox();
    await dataInbox.insertOne({
        "body":body,
        "username":username
    })
    return "pesan berhasil dikirim ke admin";
}

async function setCar(username,password,merek,plat){
    const user = await fetchUser();
    const dataUser = {
        "nama":username,
        "password":password
    }
    const mobilPeminjaman = {
        "merek":merek,
        "plat":plat
    }
    await user.updateOne(dataUser,{$push:{riwayat:mobilPeminjaman}});
    return "riwayat peminjaman berhasil ditambah";
}


let tampilUser = await showUser();
console.log(tampilUser);
let tampilMobil = await showCar();
console.log(tampilMobil);