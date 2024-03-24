function iniciarApp(){
    const resultado = document.querySelector('#resultado');
    const selectCategorias = document.querySelector('#categorias');
    const favoritosDiv = document.querySelector('.favoritos');
    
    if(selectCategorias){
        selectCategorias.addEventListener('change', seleccionarCategoria);
        obtenerCategorias();
    }
    
    if(favoritosDiv){
        obtnerFavoritos();
    }
    
    const modal = new bootstrap.Modal('#modal', {});

    
    
    function obtenerCategorias(){
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
        fetch(url)
        .then(respuesta => respuesta.json() )
        .then(datos => mostrarCategorias(datos.categories))
    }
    
    function mostrarCategorias(categorias = []){
        categorias.forEach(categoria =>{
            const {strCategory} = categoria;
            const option = document.createElement('OPTION');
            option.value = strCategory;
            option.textContent = strCategory;
            selectCategorias.appendChild(option);
        }) 
    }

    function seleccionarCategoria(e){
        const categoria = (e.target.value);
       const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;
       fetch(url)
        .then(respuesta => respuesta.json())
        .then(resultado => mostrarRecetas(resultado.meals))
    }

    function mostrarRecetas(recetas = []){
        limpiarHTML(resultado);

        const heading = document.createElement('H2');
        heading.classList.add('text-center', 'text-black', 'my-5')
        heading.innerHTML = recetas.length ? ` Hay <span class="text-danger">${recetas.length}</span> Recetas Disponibles` : 'No hay recetas';
        resultado.appendChild(heading);

        recetas.forEach(receta => {
            
            const {idMeal, strMeal, strMealThumb } = receta;
            const recetaContenedor = document.createElement('DIV');
            recetaContenedor.classList.add('col-md-4');
            
            const recetaCard = document.createElement('DIV');
            recetaCard.classList.add('card', 'mb-4');

            const recetaImagen = document.createElement('IMG');
            recetaImagen.classList.add('card-img-top');
            recetaImagen.alt = ` Imagen de la receta ${strMeal} ?? receta.titulo`;
            recetaImagen.src = strMealThumb ?? receta.imagen;
           
            const recetaCardBody = document.createElement('DIV');
            recetaCardBody.classList.add('card-body');

            const recetaHeading = document.createElement('H3');
            recetaHeading.classList.add('card-title');
            recetaHeading.textContent = strMeal ?? receta.titulo;

            const recetaButton = document.createElement('BUTTON');
            recetaButton.classList.add('btn', 'btn-danger', 'w-100');
            recetaButton.textContent = 'Ver Receta';


            recetaButton.onclick = function(){
                seleccionarReceta(idMeal ?? receta.id)

            }
            // console.log(recetaButton)

            // INYECTAR EN EL HTML

            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaButton);
            
            recetaCard.appendChild(recetaImagen);
            recetaCard.appendChild(recetaCardBody);
            
            recetaContenedor.appendChild(recetaCard);

            resultado.appendChild(recetaContenedor);

            
        })
    }

    function seleccionarReceta(id){
        
        const url = ` https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
        // console.log(url);
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado =>{
                // console.log(resultado.meals[0])
                 MostrarRecetaModal(resultado.meals[0])})

    }

    function MostrarRecetaModal(receta){

       

        const { idMeal, strInstructions, strMeal, strMealThumb } = receta;
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');

        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt="Receta ${strMeal}">
            <h3 class=""my-3> Instrucciones </h3>
            <p> ${strInstructions}</p>
            <h3 class=""my-3> Ingredientes y cantidades </h3>
        `;
        

        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');
        // MOSTRAR CANTIDADES E INGREDIENTES
         for(let i = 1; i <=  20; i++){
            if(receta[`strIngredient${i}`]){
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];

                const ingredienteLi = document.createElement('LI')
                ingredienteLi.classList.add('list-group-item');
                ingredienteLi.textContent = ` ${ingrediente} - ${cantidad} `;

                listGroup.appendChild(ingredienteLi);
            }
            
         }

         modalBody.appendChild(listGroup);

         // AÑADIR BOTONES DE FAVORITOS Y CERRAR

         const modalFooter = document.querySelector('.modal-footer');
         limpiarHTML(modalFooter);

         const btnFavorito = document.createElement('BUTTON');
         btnFavorito.classList.add('btn','btn-danger', 'col'); 
         btnFavorito.textContent = existeStorage(idMeal) ? 'Eliminar Favoritos' : 'Guardar Favoritos';
         
         
        
        // LOCALSTORAGE
        btnFavorito.onclick = function(){
            if(existeStorage(idMeal)){
                eliminarFavorito(idMeal);
                btnFavorito.textContent = 'Guardar Favorito';
                mostrarToast('Receta Eliminada Correctamente');
                return
            }
            
            agregarFavorito({
                id: idMeal,
                titulo: strMeal,
                imagen: strMealThumb,
            });
            
            btnFavorito.textContent = 'Eliminar Favorito';
            mostrarToast('Receta Agregada Correctamente');  
        }
        
         const btnCerrarModal = document.createElement('BUTTON');
         btnCerrarModal.classList.add('btn', 'btn-secondary', 'col');
         btnCerrarModal.textContent = 'Cerrar';
         btnCerrarModal.onclick = function(){
            modal.hide()
         }

         modalFooter.appendChild(btnFavorito);
         modalFooter.appendChild(btnCerrarModal);

        // MOSTRAR EL MODAL

        modal.show();
    }

    function agregarFavorito(receta){
       const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
       localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));

       if (favoritosDiv) { 
            
        const nuevosFavoritos = JSON.parse(localStorage.getItem('favoritos'));
        
        limpiarHTML(resultado);
        mostrarRecetas(nuevosFavoritos);

    }

    }


    function eliminarFavorito(id){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        const nuevosFavoritos = favoritos.filter( favorito => favorito.id !== id);
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));

        if (favoritosDiv) { 
            
            limpiarHTML(resultado);
            mostrarRecetas(nuevosFavoritos);
 
        }
    }
    
    function existeStorage(id){
     const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
     return favoritos.some(favoritos => favoritos.id === id);
    }

    function mostrarToast(mensaje){
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = mensaje;
        toast.show();
        
    }

    function obtnerFavoritos(){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
       
        const encabezado = document.createElement('H2');
        encabezado.classList.add('text-center', 'text-black', 'my-5');
        encabezado.innerHTML = `Hay <span class="text-danger">${favoritos.length}</span> recetas guardadas`;
        resultado.appendChild(encabezado);
        console.log(encabezado)
        

        if(favoritos.length){
            mostrarRecetas(favoritos);
           

            return
            }

        
            
            
            
        }
    
    function limpiarHTML(selector){
        while(selector.firstChild){
            selector.removeChild(selector.firstChild);
        }
    }

}
    

document.addEventListener('DOMContentLoaded', iniciarApp);
