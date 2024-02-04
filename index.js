import process from "process";
import readlinePromises from "readline/promises";
import { MongoClient } from 'mongodb';

const input = readlinePromises.createInterface({
    input:process.stdin,
    output:process.stdout
})

async function main(){
    let looping = true;
    console.log("Selamat datang di aplikasi CarRent");
    const username = await input.question("Masukkan nama usernamemu : ");
    const password = await input.question("Masukkan password akunmu : ");
    if(username=="admin" && password==123){
        const OpsiAdmin = ["Lihat pesan", "Tambah User", "Tambah Mobil", "Tambah Peminjaman","Hapus Pesan","Daftar Mobil", "Daftar User"];
        console.log("Selamat datang admin");
        while(looping){
            for (let i in OpsiAdmin){
                console.log(`${(Number(i)+1)} ${OpsiAdmin[i]}`);
            }
            let opsi = await input.question("Masukkan perintah yang kamu inginkan dalam angka : ");
            if(opsi==1){
                const arrayInbox = await showInbox();
                console.log("Berikut adalah pesan yang ada di inbox");
                console.log(arrayInbox);
            }else if(opsi==2){
                const usernameBaru = await input.question("Masukkan username baru : ");
                const passwordBaru = await input.question("Masukkan password baru : ");
                await addUser(usernameBaru,passwordBaru);
                console.log("User berhasil ditambahkan ke database");
            }else if(opsi==3){
                const merek = await input.question("Masukkan merek mobil yang ingin ditambahkan ke stok : ");
                const plat = await input.question("Masukkan nomor plat mobil tersebut : ");
                const keluaran = await input.question("Masukkan tahun keluaran mobil tersebut : ");
                await addCar(merek,plat,Number(keluaran));
                console.log("Mobil berhasil ditambah ke stok");
            }else if(opsi==4){
                const usernamePeminjam = await input.question("Masukkan username yang ingin meminjam mobil : ");
                const passwordPeminjam = await input.question("Masukkan password peminjam : ");
                const merek = await input.question("Masukkan merek mobil yang diminta oleh user : ");
                const plat = await input.question("Masukkan plat nomor mobil tersebut : ");
                await setCar(usernamePeminjam,passwordPeminjam,merek,plat);
                console.log("Kembali ke menu awal");
            }
        }
    }else{
        let statusLogIn = await login(username,password);
        if(statusLogIn==false){
            console.log("Nama akun atau password salah");
            let opsi = await input.question("Apakah kamu ingin membuat akun baru (ya/tidak)");
            if(opsi.toLowerCase()=="ya"){
                const usernameBaru = await input.question("Masukkan username barumu : ");
                const passwordBaru = await input.question("Masukkan password barumu : ");
                if(usernameBaru.toLowerCase()=="admin" || Number(passwordBaru)==123){
                    console.log("Username atau password tidak valid");
                }else{
                    const statusRequest = await requestSignIn(usernameBaru,passwordBaru);
                    console.log(statusRequest);
                }
            }else{
                console.log("Keluar dari program");
            }
        }else{
            console.log(`Selamat datang kembali ${username}`);
        }
    }

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
    return;
}

async function addCar(merek,plat,keluaran){
    const dataMobil = await fetchCar();
    await dataMobil.insertOne({
        "merek":merek,
        "plat":plat,
        "keluaran":keluaran,
        "status":"tersedia"
    })
    return;
}

async function setCar(username,password,merek,plat){
    const user = await fetchUser();
    const car = await fetchCar();
    const dataUser = {
        "nama":username,
        "password":password
    }
    const mobilPeminjaman = {
        "merek":merek,
        "plat":plat,
    }
    const statusUser = await car.findOne(dataUser);
    const statusMobil = await car.findOne(mobilPeminjaman);
    if(statusUser==null){
        console.log("Username tidak terdeteksi");
        return;
    }else{
        if(statusMobil == null){
            console.log("Mobil tidak tersedia");
            return;
        }else{
            await user.updateOne(dataUser,{$push:{riwayat:mobilPeminjaman}});
            await car.updateOne(mobilPeminjaman,{$set:{"status":"dipinjam"}});
            return;
        }
    }
  
    }
   

async function requestCar(username,merek,plat){
    const inbox = await fetchInbox();
    const pesanInbox = {
        "body":`${username} melakukan request peminjaman mobil merek ${merek} dengan plat ${plat}`,
        "username":username
    }
    await inbox.insertOne(pesanInbox);
    return;

}

async function requestSignIn(username,password){
    const inbox = await fetchInbox();
    const pesanInbox ={
        "body":`Pengguna baru ingin membuat akun dengan username ${username} dan password ${password}`,
        "username":"unidentified"
    }
    await inbox.insertOne(pesanInbox);
    return;
}

async function login(username,password){
    const dataUser = await fetchUser();
    const dataValid = await dataUser.findOne({nama:username,password:password});
    if(dataValid==null){
        return false;
    }else{
        return true;
    }
}

main();
