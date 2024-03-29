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
        const OpsiAdmin = ["Lihat pesan", "Tambah User", "Tambah Mobil", "Tambah Peminjaman","Hapus Pesan","Daftar Mobil",
         "Daftar User","Hapus peminjaman","Hapus mobil"];
        console.log("Selamat datang admin");
        while(looping){
            for (let i in OpsiAdmin){
                console.log(`${(Number(i)+1)} ${OpsiAdmin[i]}`);
            }
            let opsi = await input.question("Masukkan perintah yang kamu inginkan dalam angka : ");
            if(opsi==1){
                await showInbox();
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
            }else if(opsi==5){
                const idPesan = await input.question("Masukkan id pesan yang ingin kamu hapus : ");
                await deleteMessage(idPesan);
            }else if(opsi==6){
                await showCar();
            }else if(opsi==7){
                await showUser();
            }else if(opsi==8){
                const usernamePeminjam = await input.question("Masukkan username yang ingin mengembalikan mobil : ");
                const passwordPeminjam = await input.question("Masukkan password peminjam tersebut : ");
                const merek = await input.question("Masukkan merek mobil yang ingin dikembalikan : ");
                const plat = await input.question("Masukkan plat nomor mobil tersebut : ");
                await resetCar(usernamePeminjam,passwordPeminjam,merek,plat);
                console.log("Kembali ke menu awal");
            }else if(opsi==9){
                const merek = await input.question("Masukkan merek mobil yang ingin dihapus : ");
                const plat = await input.question("Masukkan plat mobil tersebut : ");
                await deleteCar(merek,plat);
            }else{
                console.log("Keluar dari program");
                process.exit(1);
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
                    await requestSignIn(usernameBaru,passwordBaru);
                    console.log("Request telah dikirm ke admin");
                }
            }else{
                console.log("Keluar dari program");
            }
        }else{
            console.log(`Selamat datang kembali ${username}`);
            while(looping){
                const opsiUser = ["Meminjam mobil","Mengembalikan mobil","Status peminjaman","keluar"];
                for(let i in opsiUser){
                    console.log(`${Number(i)+1} ${opsiUser[i]}`);
                }
                let opsi = await input.question("Masukkan layanan yang kamu inginkan (dalam angka): ");
                if(opsi==1){
                    await showCar();
                    let merek = await input.question("Masukkan merek mobil yang ingin kamu pinjam : ");
                    let plat = await input.question("Masukkan plat mobil yang ingin kamu pinjam : ");
                    await requestCar(username,password,merek,plat);
                    console.log("Request peminjaman telah dikirim ke admin");
                }else if(opsi==2){
                    let merek = await input.question("Masukkan merek mobil yang ingin kamu kembalikan : ");
                    let plat = await input.question("Masukkan plat mobil tersebut : ");
                    await requestReset(username,password,merek,plat);
                    console.log("Pesan pengembalian telah dikirim ke admin");
                }else if(opsi==3){
                    await carStatus(username,password);
                    console.log("Kembali ke halaman utama");
                }else{
                    console.log("Keluar dari program");
                    process.exit(1);
                }
            }
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
    const isiData = await dataUser.find().toArray();
    if(isiData.length==0){
        console.log("Tidak ada user di database saat ini");
        return;
    }else{
        console.log(isiData);
        return isiData;
    }
}

async function showCar(){
    const dataMobil = await fetchCar();
    const isiData = await dataMobil.find().toArray();
    if(isiData.length==0){
        console.log("Tidak ada mobil di database");
        return;
    }else{
        console.log(isiData);
        return;
    }
}

async function showInbox(){
    const dataInbox = await fetchInbox();
    const isiInbox = await dataInbox.find().toArray();
    if(isiInbox.length==0){
        console.log("Tidak ada pesan untuk saat ini");
        return;
    }else{
        console.log(isiInbox);
        return;
    }
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
        nama:username,
        password:password
    }
    const mobilPeminjaman = {
        merek:merek,
        plat:plat,
    }
    const statusUser = await user.findOne(dataUser);
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
            await car.updateOne(mobilPeminjaman,{$set:{status:"dipinjam"}});
            console.log("Mobil berhasil dipinjamkan");
            return;
        }
    }
  
    }

async function resetCar(username,password,merek,plat){
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
            console.log("Mobil tidak terdeteksi");
            return;
        }else{
            await user.updateOne(dataUser,{$pull:{riwayat:mobilPeminjaman}});
            await car.updateOne(mobilPeminjaman,{$set:{"status":"tersedia"}});
            return;
        }
    }
}
   

async function requestCar(username,password,merek,plat){
    let idPesan = Math.floor(Math.random()*100000);
    const inbox = await fetchInbox();
    const pesanInbox = {
        "body":`${username} dengan password ${password} melakukan request peminjaman mobil merek ${merek} dengan plat ${plat}`,
        "username":username,
        "idPesan":idPesan
    }
    await inbox.insertOne(pesanInbox);
    return;
}

async function requestReset(username,password,merek,plat){
    let idPesan = Math.floor(Math.random()*100000);
    const inbox = await fetchInbox();
    const pesanInbox = {
        "body":`${username} dengan password ${password} melakukan request pengembalian mobil merek ${merek} dengan plat ${plat}`,
        "username":username,
        "idPesan":idPesan
    }
    await inbox.insertOne(pesanInbox);
    return;
}

async function carStatus(username,password){
    const dataUser = await fetchUser();
    const user = await dataUser.findOne({
         "nama":username,
        "password":password
    });
    if(user.riwayat.length==0){
        console.log("Kamu sedang tidak meminjam mobil saat ini");
    }else{
        console.log((user.riwayat));
    }
    return;

}

async function deleteMessage(idPesan){
    const inbox = await fetchInbox();
    if((await inbox.find().toArray()).length==0){
        console.log("Tidak ada pesan untuk saat ini");
    }else{
        const status = await inbox.deleteOne({idPesan:Number(idPesan)});
        if(status.deletedCount==0){
            console.log("pesan tidak dideteksi");
            return;
        }else{
            console.log("Pesan berhasil dihapus");
            return;
        }
    }
}

async function deleteCar(merek,plat){
    const car = await fetchCar();
    if((await car.find().toArray()).length==0){
        console.log("Tidak ada mobil saat ini di database");
    }else{
       const status= await car.deleteOne({
            "merek":merek,
            "plat":plat
        })
        if(status.deletedCount==0){
            console.log("Mobil tidak ditemukan");
            return;
        }else{
            console.log("Mobil berhasil dihapus");
            return;
        }
        
    }

}

async function requestSignIn(username,password){
    let idPesan = Math.floor(Math.random()*100000);
    const inbox = await fetchInbox();
    const pesanInbox ={
        "body":`Pengguna baru ingin membuat akun dengan username ${username} dan password ${password}`,
        "username":"unidentified",
        "idPesan":idPesan
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
