document.addEventListener('DOMContentLoaded', () => {

    // Constantes para menu hamburgues
    const $barsMenu = document.querySelector('.barsMenu');
    const $line1 = document.querySelector('.line1');
    const $line2 = document.querySelector('.line2');
    const $line3 = document.querySelector('.line3');

    // function animacion icono menu hamburgues
    $barsMenu.addEventListener('click', animateBars);
    function animateBars() {
        $line1.classList.toggle('activeLine1')
        $line2.classList.toggle('activeLine2')
        $line3.classList.toggle('activeLine3')
    }

    // Ventana  lateral open/close
    const $menuContainer = document.querySelector('.menuContainer');
    const $main = document.querySelector('main');
    const $miVentanaEmergente = document.querySelector('.miVentanaEmergente');
    const $body = document.querySelector('body')




    $barsMenu.addEventListener('click', () => {
        if (!$miVentanaEmergente.classList.contains('miVentanaEmergente')) {
            $miVentanaEmergente.classList.add('miVentanaEmergente')
        }
        $menuContainer.classList.toggle('menu-open');
        $main.classList.toggle('blur');
        $body.classList.toggle('hidden')
    });

    // este evento escucha si el enlace a fue clickeado dentro del menucontainer
    $menuContainer.addEventListener('click', (e) => {
        // Verificar si el elemento clicado es un enlace
        if (e.target.tagName === 'A') {
            // Cerrar la barra lateral
            $menuContainer.classList.remove('menu-open');
            $main.classList.remove('blur')
            animateBars()
        }
        $body.classList.remove('hidden')
    });

    //Despliega menu para seleccionar tema
    const $iconoTema = document.getElementById('miIcono')

    $iconoTema.addEventListener('click', () => {
        if ($menuContainer.classList.contains('menu-open')) {
            $menuContainer.classList.remove('menu-open')
            $main.classList.remove('blur')
            animateBars()
        }

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
        typeSpeed: 70,
        backSpeed: 50,
        showCursor: false,
        loop: false,
        onComplete: function () {
            const typed2 = new Typed($h2nombre, {
                strings: ['Agustín Mondati.'],
                typeSpeed: 70,
                backSpeed: 50,
                showCursor: false,
                loop: false,
                onComplete: function () {
                    const typed3 = new Typed($h3ocupacion, {
                        strings: ['Construyo cosas para la web.'],
                        typeSpeed: 70,
                        backSpeed: 50,
                        showCursor: false,
                        loop: false
                    });
                }
            });
        }
    });


});
