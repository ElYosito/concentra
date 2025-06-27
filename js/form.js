// Importar desde CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Tu configuración (reemplaza con tus propios datos)
const firebaseConfig = {
    apiKey: "AIzaSyBsz170scgjpFu8w9EoVgxUPLbHW0Rc_Hc",
    authDomain: "concentra-392ff.firebaseapp.com",
    projectId: "concentra-392ff",
    storageBucket: "concentra-392ff.appspot.com",
    messagingSenderId: "45875078617",
    appId: "1:45875078617:web:0690faaabe6f1f3b3de5c8"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Relación de liga con iglesia (igual que antes)
const ligaToIglesia = {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9
};

const iglesiaToLiga = Object.fromEntries(
    Object.entries(ligaToIglesia).map(([k, v]) => [v, k])
);

const selectLiga = document.getElementById("selectLiga");
const selectIglesia = document.getElementById("selectIglesia");

// Sincronizar selects
selectLiga.addEventListener("change", () => {
    const ligaValue = selectLiga.value;
    if (ligaToIglesia[ligaValue]) {
        selectIglesia.value = ligaToIglesia[ligaValue];
    }
});

selectIglesia.addEventListener("change", () => {
    const iglesiaValue = selectIglesia.value;
    if (iglesiaToLiga[iglesiaValue]) {
        selectLiga.value = iglesiaToLiga[iglesiaValue];
    }
});

// Guardar en Firestore
const registrarBtn = document.querySelector(".btn-success");

registrarBtn.addEventListener("click", async () => {
    const mensaje = document.getElementById("mensajeRegistro"); // ✅ Aquí la defines

    const liga = selectLiga.options[selectLiga.selectedIndex].text;
    const iglesia = selectIglesia.options[selectIglesia.selectedIndex].text;
    const numJovenes = parseInt(document.getElementById("jovenes").value) || 0;
    const numConsejeros = parseInt(document.getElementById("consejeros").value) || 0;
    const sonPastores = document.getElementById("checkDefault").checked;
    const numPastores = parseInt(document.getElementById("pastores").value) || 0;

    if (liga === "Selecciona una opción" || iglesia === "Selecciona una opción") {
        mensaje.textContent = "Selecciona una liga y una iglesia válidas.";
        mensaje.classList.remove("text-success");
        mensaje.classList.add("text-danger");
        setTimeout(() => { mensaje.textContent = ""; }, 5000);
        return;
    }

    if (sonPastores && numPastores > numConsejeros) {
        mensaje.textContent = "Si los consejeros son pastores, el número de pastores no puede ser mayor que el número de consejeros.";
        mensaje.classList.remove("text-success");
        mensaje.classList.add("text-danger");
        setTimeout(() => { mensaje.textContent = ""; }, 5000);
        return;
    }

    // Validar si la iglesia ya está registrada
    const querySnapshot = await getDocs(collection(db, "ligas"));
    const iglesiaYaExiste = querySnapshot.docs.some(doc => doc.data().iglesia === iglesia);

    if (iglesiaYaExiste) {
        mensaje.textContent = "Esta iglesia ya ha sido registrada.";
        mensaje.classList.remove("text-success");
        mensaje.classList.add("text-danger");
        setTimeout(() => { mensaje.textContent = ""; }, 5000);
        return;
    }

    const total = sonPastores
        ? numJovenes + numConsejeros
        : numJovenes + numConsejeros + numPastores;

    try {
        await addDoc(collection(db, "ligas"), {
            liga,
            iglesia,
            numJovenes,
            numConsejeros,
            sonPastores,
            numPastores,
            total,
            timestamp: new Date()
        });

        mensaje.textContent = `Registro guardado exitosamente. Total: ${total}`;
        mensaje.classList.remove("text-danger");
        mensaje.classList.add("text-success");
        setTimeout(() => { mensaje.textContent = ""; }, 5000);

        // Limpiar campos
        selectLiga.value = "Selecciona una opción";
        selectIglesia.value = "Selecciona una opción";
        document.getElementById("jovenes").value = "";
        document.getElementById("consejeros").value = "";
        document.getElementById("checkDefault").checked = false;
        document.getElementById("pastores").value = "";
    } catch (e) {
        console.error("Error al guardar en Firebase:", e);
        mensaje.textContent = "Hubo un error al guardar.";
        mensaje.classList.remove("text-success");
        mensaje.classList.add("text-danger");
        setTimeout(() => { mensaje.textContent = ""; }, 5000);
    }
});