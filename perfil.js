document.addEventListener('DOMContentLoaded', () => {

    // --- VARIABLES GLOBALES ---
    let vehiculosCargados = []; // Almacén para los menús desplegables
    let garageUsuario = [];     // Almacén para el garage guardado
    let tarjetaParaBorrar = null; // Para el modal de borrado
    let vehiculoSeleccionadoId = null; // Para saber qué auto está seleccionado

    // --- ELEMENTOS DEL DOM ---
    const zonaLogin = document.getElementById('zona-login');
    const zonaPerfil = document.getElementById('zona-perfil');
    
    // Login
    const loginForm = document.getElementById('login-form');
    const btnRegister = document.getElementById('btn-register');
    const btnLogout = document.getElementById('btn-logout');

    // Filtros
    const selectFabricante = document.getElementById('select-fabricante');
    const selectModelo = document.getElementById('select-modelo');
    const selectVehiculo = document.getElementById('select-vehiculo');
    const btnAddVehiculo = document.getElementById('btn-add-vehiculo');

    // Garage y Tareas
    const garageDiv = document.getElementById('vehiculos-guardados');
    const listaDiv = document.getElementById('lista-mantenimiento');

    // Modal
    const modalConfirmar = document.getElementById('modal-confirmar');
    const btnModalSi = document.getElementById('btn-modal-si');
    const btnModalNo = document.getElementById('btn-modal-no');


    // Revisa si hay un usuario en localStorage y muestra la sección correcta. Se llama al cargar la página.
    function checkLoginState() {
        const usuarioSimulado = localStorage.getItem('autologUser');
        
        if (usuarioSimulado) {
            // Usuario SÍ está logueado
            zonaLogin.style.display = 'none';
            zonaPerfil.style.display = 'block';

            const userDisplay = document.querySelector('#zona-perfil .perfil-header h2');
            if (userDisplay) {
                userDisplay.textContent = `Garage de ${usuarioSimulado}`;
            }
            
            cargarFabricantes();
            cargarGarageDesdeLocalStorage();

        } else {
            // Usuario NO está logueado
            zonaLogin.style.display = 'block';
            zonaPerfil.style.display = 'none';
        }
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        if (!email) {
            alert('Por favor, ingresá un email.');
            return;
        }
        localStorage.setItem('autologUser', email);
        checkLoginState();
    });

    btnRegister.addEventListener('click', () => {
        const email = document.getElementById('email').value;
        if (!email) {
            alert('Por favor, ingresá un email.');
            return;
        }
        localStorage.setItem('autologUser', email);
        checkLoginState();
    });

    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('autologUser');
        localStorage.removeItem('autologGarage');
        
        // Limpiamos todo
        garageDiv.innerHTML = '<p>Aún no tenés vehículos en tu garage.</p>';
        listaDiv.innerHTML = '';
        vehiculoSeleccionadoId = null;
        garageUsuario = [];
        
        checkLoginState(); // Vuelve a la pantalla de login
    });



    // Carga el garage guardado desde localStorage al iniciar la app.
    function cargarGarageDesdeLocalStorage() {
        const garageGuardado = JSON.parse(localStorage.getItem('autologGarage'));
        
        if (garageGuardado && Array.isArray(garageGuardado)) {
            garageUsuario = garageGuardado;
            
            garageDiv.innerHTML = ''; // Limpiar el "No tenés vehículos"

            // Volvemos a crear cada tarjeta
            garageUsuario.forEach(vehiculo => {
                mostrarTarjetaVehiculo(vehiculo);
            });
        }
    }

    // Guarda el array completo del garage en localStorage.
    function guardarGarageEnLocalStorage() {
        localStorage.setItem('autologGarage', JSON.stringify(garageUsuario));
    }

    // Agrega un vehículo al garage y lo guarda.
    // Se llama cuando el usuario hace clic en "Añadir".
    function agregarVehiculoAlGarage(vehiculoId) {
        const vehiculo = vehiculosCargados.find(v => v.id === vehiculoId);
        if (!vehiculo) return;

        const marcaNombre = selectFabricante.options[selectFabricante.selectedIndex].text;
        const modeloNombre = selectModelo.options[selectModelo.selectedIndex].text;
        
        const vehiculoParaGuardar = {
            id: vehiculo.id,
            foto_url: vehiculo.foto_url,
            marca: marcaNombre,
            modelo: modeloNombre,
            version: `${vehiculo.ano} - ${vehiculo.motor}`
        };

        garageUsuario.push(vehiculoParaGuardar);
        guardarGarageEnLocalStorage();
        
        mostrarTarjetaVehiculo(vehiculoParaGuardar);
    }

    // Crea el HTML de la tarjeta y la muestra en el garage.
    function mostrarTarjetaVehiculo(vehiculo) {
        // Limpiamos el mensaje "Aún no tenés vehículos..."
        const pMensajeVacio = garageDiv.querySelector('p');
        if (pMensajeVacio) pMensajeVacio.remove();
        
        // Creamos la tarjeta
        const tarjetaHTML = `
            <div class="garage-card" data-card-id="${vehiculo.id}">
                <img src="${vehiculo.foto_url}" alt="${vehiculo.marca} ${vehiculo.modelo}" />
                <div class="garage-card-info">
                    <strong>${vehiculo.marca} ${vehiculo.modelo}</strong>
                    <p>${vehiculo.version}</p>
                </div>
                <button class="btn-eliminar-vehiculo" data-id="${vehiculo.id}">
                    &times; 
                </button>
            </div>
        `;
        
        garageDiv.innerHTML += tarjetaHTML;
    }

    // Listener para Fabricante
    selectFabricante.addEventListener('change', () => {
        const fabricanteId = selectFabricante.value;
        selectModelo.innerHTML = '<option value="">2. Elegí el modelo...</option>';
        selectModelo.disabled = true;
        selectVehiculo.innerHTML = '<option value="">3. Elegí la versión...</option>';
        selectVehiculo.disabled = true;
        btnAddVehiculo.disabled = true;

        if (fabricanteId) {
            cargarModelos(fabricanteId);
        }
    });

    // Listener para Modelo
    selectModelo.addEventListener('change', () => {
        const modeloId = selectModelo.value;
        selectVehiculo.innerHTML = '<option value="">3. Elegí la versión...</option>';
        selectVehiculo.disabled = true;
        btnAddVehiculo.disabled = true;
        
        if (modeloId) {
            cargarVehiculos(modeloId);
        }
    });

    // Listener para Vehículo (habilita el botón)
    selectVehiculo.addEventListener('change', () => {
        const vehiculoId = selectVehiculo.value;
        if (vehiculoId) {
            btnAddVehiculo.disabled = false;
        } else {
            btnAddVehiculo.disabled = true;
        }
    });

    // Listener para el botón "Añadir a mi Garage"
    btnAddVehiculo.addEventListener('click', () => {
        const vehiculoId = selectVehiculo.value;

        if (!vehiculoId) {
            alert('Por favor, selecciona una version válida');
            return;
        }
        
        agregarVehiculoAlGarage(vehiculoId);

        // Reseteamos los menus
        selectFabricante.selectedIndex = 0;
        selectModelo.innerHTML = '<option value="">2. Elegí el modelo...</option>';
        selectModelo.disabled = true;
        selectVehiculo.innerHTML = '<option value="">3. Elegí la versión...</option>';
        selectVehiculo.disabled = true;
        btnAddVehiculo.disabled = true;
    });

    garageDiv.addEventListener('click', (e) => {
        
        if (e.target.matches('.btn-eliminar-vehiculo')) {
            tarjetaParaBorrar = e.target.closest('.garage-card');
            modalConfirmar.classList.add('visible');
            
        } else {
            const tarjetaClickeada = e.target.closest('.garage-card');
            if (!tarjetaClickeada) return;

            garageDiv.querySelectorAll('.garage-card').forEach(card => {
                card.classList.remove('selected');
            });

            tarjetaClickeada.classList.add('selected');

            const vehiculoId = tarjetaClickeada.dataset.cardId;
            vehiculoSeleccionadoId = vehiculoId;
            
            cargarTareas(vehiculoId);
            
        }
    });

    // Listener para el botón "SÍ, Eliminar" del modal
    btnModalSi.addEventListener('click', () => {
        if (tarjetaParaBorrar) {
            const idBorrado = tarjetaParaBorrar.dataset.cardId;
            tarjetaParaBorrar.remove();
            
            // Eliminar de localStorage
            garageUsuario = garageUsuario.filter(v => v.id !== idBorrado);
            guardarGarageEnLocalStorage();

            if (idBorrado === vehiculoSeleccionadoId) {
                listaDiv.innerHTML = '';
                vehiculoSeleccionadoId = null;
            }
            
            if (garageUsuario.length === 0) {
                garageDiv.innerHTML = '<p>Aún no tenés vehículos en tu garage.</p>';
            }
        }
        modalConfirmar.classList.remove('visible');
        tarjetaParaBorrar = null;
    });

    // Listener para el botón "Cancelar" del modal
    btnModalNo.addEventListener('click', () => {
        modalConfirmar.classList.remove('visible');
        tarjetaParaBorrar = null;
    });


    // Carga Fabricantes
    async function cargarFabricantes() {
        // ... (código de 'async function cargarFabricantes' sin cambios)
        console.log("Intentando cargar fabricantes desde la API...");
        try {
            const response = await fetch('http://localhost:3000/api/fabricantes');
            if (!response.ok) throw new Error(`Error de red: ${response.statusText}`);
            const data = await response.json();
            
            selectFabricante.innerHTML = '<option value="">1. Elegí la marca...</option>';
            data.forEach(fabricante => {
                const option = document.createElement('option');
                option.value = fabricante.id;
                option.textContent = fabricante.nombre;
                selectFabricante.appendChild(option);
            });
            selectFabricante.disabled = false;
        } catch (error) {
            console.error("Falló la carga de fabricantes:", error);
            selectFabricante.innerHTML = '<option value="">Error al cargar datos</option>';
            selectFabricante.disabled = true;
        }
    }

    // Carga Modelos
    async function cargarModelos(fabricanteId) {
        console.log(`Cargando modelos para el fabricante ID: ${fabricanteId}`);
        try {
            const response = await fetch(`http://localhost:3000/api/modelos/${fabricanteId}`);
            if (!response.ok) throw new Error(`Error de red: ${response.statusText}`);
            const data = await response.json();
            
            selectModelo.innerHTML = '<option value="">2. Elegí el modelo...</option>';
            data.forEach(modelo => {
                const option = document.createElement('option');
                option.value = modelo.id;
                option.textContent = modelo.nombre;
                selectModelo.appendChild(option);
            });
            selectModelo.disabled = false;
        } catch (error) {
            console.error("Falló la carga de modelos:", error);
            selectModelo.innerHTML = '<option value="">Error al cargar datos</option>';
            selectModelo.disabled = true;
        }
    }

    // Carga Vehículos y los guarda en 'vehiculosCargados'
    async function cargarVehiculos(modeloId) {
        console.log(`Cargando vehículos para el modelo ID: ${modeloId}`);
        try {
            const response = await fetch(`http://localhost:3000/api/vehiculos/${modeloId}`);
            if (!response.ok) throw new Error(`Error de red: ${response.statusText}`);
            const data = await response.json();
            
            vehiculosCargados = data;
            
            selectVehiculo.innerHTML = '<option value="">3. Elegí la versión...</option>';
            data.forEach(vehiculo => {
                const option = document.createElement('option');
                option.value = vehiculo.id;
                option.textContent = `${vehiculo.ano} - ${vehiculo.motor}`; 
                selectVehiculo.appendChild(option);
            });
            selectVehiculo.disabled = false;
        } catch (error) {
            console.error("Falló la carga de vehículos:", error);
            selectVehiculo.innerHTML = '<option value="">Error al cargar datos</option>';
            selectVehiculo.disabled = true;
        }
    }

    
     // Carga Tareas
    async function cargarTareas(vehiculoId) {
        console.log(`Cargando tareas para el vehículo ID: ${vehiculoId}`);
        
        if (listaDiv.innerHTML !== '') {
            listaDiv.style.opacity = 0;
        }
        await new Promise(resolve => setTimeout(resolve, 500)); 
        
        listaDiv.innerHTML = '<p>Buscando plan de mantenimiento...</p>';
        listaDiv.style.opacity = 1;

        try {
            const response = await fetch(`http://localhost:3000/api/tareas/${vehiculoId}`);
            if (!response.ok) throw new Error(`Error de red: ${response.statusText}`);
            
            const tareas = await response.json();
            let html = '';

            if (tareas.length === 0) {
                html = '<h4>Plan de Mantenimiento</h4><p>No se encontraron tareas de mantenimiento programadas para este vehículo.</p>';
            } else {
                const componentes = {};
                tareas.forEach(tarea => {
                    if (!componentes[tarea.componente]) {
                        componentes[tarea.componente] = [];
                    }
                    componentes[tarea.componente].push(tarea);
                });

                const ordenComponentes = ["Motor", "Transmisión", "Frenos", "Varios"];
                
                html = '<h4>Plan de Mantenimiento</h4>';
                html += `<p class="disclaimer">Los datos son brindados por el fabricante, cada caso es único. Consultar manual o mecánico de confianza.</p>`;

                ordenComponentes.forEach(nombreComponente => {
                    if (componentes[nombreComponente]) {
                        html += `<strong>${nombreComponente}</strong><ul>`;
                        componentes[nombreComponente].forEach(t => {
                            html += `<li>${t.tarea} ${t.intervalo_km}</li>`;
                        });
                        html += '</ul>';
                        delete componentes[nombreComponente];
                    }
                });

                for (const nombreComponente in componentes) {
                    html += `<strong>${nombreComponente}</strong><ul>`;
                    componentes[nombreComponente].forEach(t => {
                        html += `<li>${t.tarea} ${t.intervalo_km}</li>`;
                    });
                    html += '</ul>';
                }
            }

            listaDiv.style.opacity = 0;
            await new Promise(resolve => setTimeout(resolve, 500)); 
            listaDiv.innerHTML = html;
            listaDiv.style.opacity = 1;

            await new Promise(resolve => setTimeout(resolve, 500));
            listaDiv.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error("Falló la carga de tareas:", error);
            listaDiv.style.opacity = 0;
            await new Promise(resolve => setTimeout(resolve, 500));
            listaDiv.innerHTML = '<p style="color: red;">Error al cargar las tareas.</p>';
            listaDiv.style.opacity = 1;
        }
    }

    
    // Llamamos a la única función que revisa el estado del login
    checkLoginState();

});