import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getFirestore,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let idActualEditar = null;

const firebaseConfig = {
    apiKey: "AIzaSyBsz170scgjpFu8w9EoVgxUPLbHW0Rc_Hc",
    authDomain: "concentra-392ff.firebaseapp.com",
    projectId: "concentra-392ff",
    storageBucket: "concentra-392ff.appspot.com",
    messagingSenderId: "45875078617",
    appId: "1:45875078617:web:0690faaabe6f1f3b3de5c8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tbody = document.querySelector("tbody");
const totalElement = document.querySelector("h2");

function escucharLigasEnTiempoReal() {
    const ligasRef = collection(db, "ligas");

    onSnapshot(ligasRef, (snapshot) => {
        tbody.innerHTML = "";
        let totalGeneral = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            const id = doc.id;
            const { liga, iglesia, numJovenes, numConsejeros, numPastores, sonPastores } = data;

            const totalFila = (numJovenes || 0) + (numConsejeros || 0) + (sonPastores ? 0 : (numPastores || 0));
            totalGeneral += totalFila;

            const tr = document.createElement("tr");
            tr.setAttribute("data-id", id);
            tr.innerHTML = `
                <td>${liga}</td>
                <td>${iglesia}</td>
                <td>${numJovenes ?? 0}</td>
                <td>${numConsejeros ?? 0}</td>
                <td>${numPastores ?? 0}</td>
                <td><strong>${totalFila}</strong></td>
            `;
            tr.addEventListener("click", () => abrirFormularioEdicion(id, data));

            tbody.appendChild(tr);
        });

        totalElement.textContent = `Total general: ${totalGeneral}`;
    });
}

escucharLigasEnTiempoReal();

async function borrarTodasLasLigas() {
    if (!confirm("¿Estás seguro de que quieres borrar todos los registros? Esta acción no se puede deshacer.")) {
        return;
    }

    btnBorrar.disabled = true; // Desactiva
    btnBorrar.style.opacity = "0.5"; // Visualmente desactivado

    try {
        const querySnapshot = await getDocs(collection(db, "ligas"));
        const borras = querySnapshot.docs.map((documento) =>
            deleteDoc(doc(db, "ligas", documento.id))
        );

        await Promise.all(borras);
        escucharLigasEnTiempoReal();
    } catch (error) {
        console.error("Error al borrar los registros:", error);
        alert("Ocurrió un error al borrar los registros.");
    } finally {
        btnBorrar.disabled = false; // Reactiva
        btnBorrar.style.opacity = "1";
    }
}

const btnBorrar = document.getElementById("borrarLigas");
btnBorrar.addEventListener("click", borrarTodasLasLigas);


function abrirFormularioEdicion(id, data) {
    idActualEditar = id;
    document.getElementById("formEditar").style.display = "block";
    document.getElementById("editLiga").value = data.liga;
    document.getElementById("editIglesia").value = data.iglesia;
    document.getElementById("editJovenes").value = data.numJovenes || 0;
    document.getElementById("editConsejeros").value = data.numConsejeros || 0;
    document.getElementById("editPastores").value = data.numPastores || 0;
    document.getElementById("editSonPastores").checked = data.sonPastores || false;
}

document.getElementById("btnGuardarEdicion").addEventListener("click", async () => {
    if (!idActualEditar) return;

    const liga = document.getElementById("editLiga").value;
    const iglesia = document.getElementById("editIglesia").value;
    const numJovenes = parseInt(document.getElementById("editJovenes").value) || 0;
    const numConsejeros = parseInt(document.getElementById("editConsejeros").value) || 0;
    const numPastores = parseInt(document.getElementById("editPastores").value) || 0;
    const sonPastores = document.getElementById("editSonPastores").checked;

    const total = sonPastores
        ? numJovenes + numConsejeros
        : numJovenes + numConsejeros + numPastores;

    try {
        await updateDoc(doc(db, "ligas", idActualEditar), {
            liga,
            iglesia,
            numJovenes,
            numConsejeros,
            numPastores,
            sonPastores,
            total,
            timestamp: new Date()
        });

        document.getElementById("formEditar").style.display = "none";
        escucharLigasEnTiempoReal();
    } catch (error) {
        console.error("Error al actualizar:", error);
        alert("Hubo un error al actualizar el registro.");
    }
});