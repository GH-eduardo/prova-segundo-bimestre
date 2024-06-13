function formatarData(data) {
    let dataBr = data.toLocaleDateString('pt-BR').split('/')
    let dia = parseInt(dataBr[0]) + 1
    let mes = parseInt(dataBr[1])
    let ano = parseInt(dataBr[2])

    if (dia == 32) {
        dia = 1
        mes++
    }
    if (mes == 13) {
        mes = 1
        ano++
    }
    dia = dia.toString()
    mes = mes.toString()

    if (dia.length == 1) {
        dia = '0' + dia
    }
    if (mes.length == 1) {
        mes = '0' + mes
    }

    let dataFormatada = dia + '-' + mes + '-' + ano
    return dataFormatada
}

function atualizarFiltros(pagina) {
    let cont = 0

    let tipo = document.querySelector('#tipo')
    let qtd = document.querySelector('#qtd')
    let de = document.querySelector('#de')
    let ate = document.querySelector('#até')

    const url = new URL(window.location)
    url.searchParams.delete('tipo');
    url.searchParams.delete('de');
    url.searchParams.delete('ate');
    url.searchParams.delete('page');
    url.searchParams.set('qtd', qtd.value)

    if (tipo.value != '') {
        url.searchParams.set('tipo', tipo.value)
        cont++
    }
    if (qtd.value != 10) {
        cont++
    }
    if (de.value != '') {
        let data = new Date(de.value)
        data = formatarData(data)
        url.searchParams.set('de', data)
        cont++
    }
    if (ate.value != '') {
        let data = new Date(ate.value)
        data = formatarData(data)
        url.searchParams.set('ate', data)
        cont++
    }
    if (pagina != '') {
        url.searchParams.set('page', pagina)
    }
    document.querySelector('#spanFiltro').textContent = `(${cont})`
    window.history.pushState({}, '', url);

    carregarNoticias()
}

function carregarNoticias() {

    const url = new URL(window.location)
    let queryString = url.search
    console.log(queryString)
    let link = 'http://servicodados.ibge.gov.br/api/v3/noticias/'

    fetch(link + queryString)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na requisição: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log('Página do retorno do fetch: ' + data.page)
            console.log(data)
            adicionarPaginacao(data.page)
            data.items.forEach(item => {
                let li = document.createElement('li')
                li.id = item.id
                let h2 = document.createElement('h2')
                h2.innerText = item.titulo
                li.appendChild(h2)
                let img = document.createElement('img')
                let imagens = JSON.parse(item.imagens)
                img.src = 'https://agenciadenoticias.ibge.gov.br/' + imagens.image_intro
                li.appendChild(img)
                let p = document.createElement('p')
                p.innerText = item.introducao
                li.appendChild(p)
                p = document.createElement('p')
                p.innerText = '#' + item.editorias
                li.appendChild(p)
                p = document.createElement('p')
                p.innerText = 'Publicado ' + calcularDiferenca(item.data_publicacao)
                li.appendChild(p)
                let button = document.createElement('button')
                button.innerText = 'Leia mais'
                button.addEventListener('click', function () {
                    window.open(item.link, '_blank')
                })
                li.appendChild(button)

                let lista = document.querySelector('#listaDeNoticias')
                if (lista == null) {
                    lista = document.createElement('ul')
                    lista.id = 'listaDeNoticias'
                    document.querySelector('main').appendChild(lista)
                }
                lista.appendChild(li)
            })
        })
        .catch(error => console.error('Erro:', error));
}

function calcularDiferenca(dataPublicacao) {

    let dataRecebida = dataPublicacao

    let dataAtual = new Date()
    let partes = dataRecebida.split(/[/ :]/);
    dataRecebida = new Date(partes[2], partes[1]-1, partes[0], partes[3], partes[4], partes[5]);
    dataRecebida = new Date(dataRecebida)
    let diferenca = dataAtual - dataRecebida
    let dias = Math.floor(diferenca / (1000 * 60 * 60 * 24)) // um dia em milisegundos

    dias = Math.abs(dias)
    anos = Math.floor(dias/365)
    meses = Math.floor(dias%365/30)

    let stringDiferenca = ''

    if (anos >= 1) { // faz mais de 1 ano
        if (anos >= 2) {
            stringDiferenca = 'há ' + anos + ' anos'
        }
        else {
            stringDiferenca = 'há 1 ano'
        }
        if (meses >= 1) {
            if (meses >= 2) {
                stringDiferenca += ' e ' + meses + ' meses'
            }
            else {
                stringDiferenca += ' e 1 mês'
            }
        }
    }
    else if (meses >= 1) { // faz mais de 1 mês
        if (meses >= 2) {
            stringDiferenca = 'há ' + meses + ' meses'
        }
        else {
            stringDiferenca = 'há 1 mês'
        }

        if (dias%365%30 >= 1) { // se não estiver em um 'mêsversário' mostra também os dias
            if (dias%365%30 >= 2) {
                stringDiferenca += ' e ' + (dias%365%30) + ' dias'
            }
            else {
                stringDiferenca += ' e 1 dia'
            }
        }
    }
    else { // faz menos de 1 mês
        if (dias >= 1) {
            if (dias >= 3) {
                stringDiferenca += 'há ' + dias + ' dias'
            }
            else if (dias == 2) {
                stringDiferenca += 'anteontem'
            }
            else {
                stringDiferenca += 'ontem'
            }
        }
        else {
            stringDiferenca += 'hoje'
        }
    }

    return stringDiferenca
}

function adicionarPaginacao(pagina) {
    let ul = document.querySelector('#paginacao')

    if (ul == null) {
        ul = document.createElement('ul')
        ul.id = 'paginacao'
        document.querySelector('footer').appendChild(ul)
    }

    let aux = pagina - 5 //
    if (aux < 1) {
        aux = 1
    }

    let li = document.createElement('li')
    let a = document.createElement('a')
    if (pagina != 1) {
        a.addEventListener('click', () => {
            document.querySelector('ul').remove()
            document.querySelector('ul').remove()
            atualizarFiltros(pagina - 1)
        })
    }
    a.innerText = '<'
    li.appendChild(a)
    ul.appendChild(li)

    for (let index = 1; index <= 10; index++) {
        li = document.createElement('li')
        a = document.createElement('a')
        a.innerText = aux
        if (a.innerText == pagina) {
            let paginaAtual = document.querySelector('#paginaAtual')
            if(paginaAtual != null){
                paginaAtual.remove()
            }
            a.id = 'paginaAtual'
        }
        aux++
        if (a.innerText != pagina) {
            let valorDoMomento = a.innerText
            a.addEventListener('click', () => {
                document.querySelector('ul').remove()
                document.querySelector('ul').remove()
                atualizarFiltros(valorDoMomento)
            })
        }
        li.appendChild(a)
        ul.appendChild(li)
    }

    li = document.createElement('li')
    a = document.createElement('a')
    a.addEventListener('click', () => {
        document.querySelector('ul').remove()
        document.querySelector('ul').remove()
        atualizarFiltros(pagina + 1)
    }) 
    a.innerText = '>'
    li.appendChild(a)
    ul.appendChild(li)
}

function openDialog() {
    let dialog = document.querySelector('#dialog')
    dialog.showModal()
}

function closeDialog() {
    let dialog = document.querySelector('#dialog')
    dialog.close()
}