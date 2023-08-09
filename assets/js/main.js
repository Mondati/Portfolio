document.addEventListener('DOMContentLoaded', () => {

    // Ventana  lateral open/close
    const $miVentanaEmergente = document.querySelector('.miVentanaEmergente');


    //Despliega menu para seleccionar tema
    const $iconoTema = document.getElementById('miIcono')

    $iconoTema.addEventListener('click', () => {
        $miVentanaEmergente.classList.toggle('miVentanaEmergente')
    })


    //Aplica el tema selecciona al html y mediante oobtener el boton clickeado devuelve la li padre bel btn y
    // le aplica la clase seleccionado en casode no ser el elemento seleccioando la borra
    const $botonListaTema = document.querySelectorAll('.botonListaTema');
    $botonListaTema.forEach(btn => {
        btn.addEventListener('click', e => {
            const theme = btn.dataset.theme;
            document.documentElement.setAttribute('data-theme', theme);

            // Obtener la li correspondiente al botón seleccionado
            const $liSeleccionado = btn.parentNode;

            // Remover la clase 'seleccionado' de todas las demás li
            const $listaItems = document.querySelectorAll('.listaItemTema');
            $listaItems.forEach(item => {
                if (item !== $liSeleccionado) {
                    item.classList.remove('seleccionado');
                }
            });

            // Agregar la clase 'seleccionado' al li correspondiente al botón seleccionado
            $liSeleccionado.classList.add('seleccionado');
        });
    });

    const $h1 = document.querySelector('h1');
    const $h2nombre = document.querySelector('.nombre');
    const $h3ocupacion = document.querySelector('.ocupacion');


    const typed1 = new Typed($h1, {
        strings: ['Hola, mi nombre es'],
        typeSpeed: 40,
        backSpeed: 50,
        showCursor: false,
        loop: false,
        onComplete: function () {
            const typed2 = new Typed($h2nombre, {
                strings: ['Agustín Mondati'],
                typeSpeed: 40,
                backSpeed: 50,
                showCursor: false,
                loop: false,
                onComplete: function () {
                    const typed3 = new Typed($h3ocupacion, {
                        strings: ['Construyo cosas para la web.'],
                        typeSpeed: 40,
                        backSpeed: 50,
                        showCursor: false,
                        loop: false
                    });
                }
            });
        }
    });


});
