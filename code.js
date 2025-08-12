
const debug = false;
const tabuleiro = document.querySelector("#tabuleiro");

let bot;
let obrigatorioComer;
let podeComerParaTras;

let contadorPecasPretas = 0;
let contadorPecasBrancas = 0;
let arrayTabuleiro = [];
let vezJogada = "preta";

if (debug) {
    comecarJogo()
    bot = false
    obrigatorioComer = false
    podeComerParaTras = true
}

function comecarJogo() {

    document.querySelector("#popUpContainer").style.display = "none";

    configurarVariaveis();

    iniciarTabuleiro();

    mudarVez();

}

function configurarVariaveis() {

    if (debug) return;
    // bot = document.getElementById("jogadorxjogador").checked ? false : true;
    bot = false
    obrigatorioComer = document.getElementById("obrigatorioComer").checked ? true : false
    podeComerParaTras = document.getElementById("comerParaTras").checked ? true : false

}

function iniciarTabuleiro() {

    let corEspaco = "branco";
    let quadradoTabuleiro;
    let tempArrayLinhaTabuleiro;

    for (let c = 0; c < 8; c++) {
        tempArrayLinhaTabuleiro = [];
        for (let d = 0; d < 8; d++) {
            tempArrayLinhaTabuleiro.push([]);
            quadradoTabuleiro = document.createElement("div");
            quadradoTabuleiro.classList.add(`espaco`);
            quadradoTabuleiro.classList.add(`L${c}-${d}`);
            quadradoTabuleiro.classList.add(corEspaco);
            tabuleiro.appendChild(quadradoTabuleiro);
            corEspaco = corEspaco == "branco" ? "preto" : "branco";
        }
        corEspaco = corEspaco == "branco" ? "preto" : "branco";
        arrayTabuleiro.push(tempArrayLinhaTabuleiro);
    }

    let peca;

    for (let c = 0; c < 8; c++) {

        for (let d = 0; d < 8; d++) {

            if ((c + d) % 2 == 1 && (c < 3 || c > 4)) {

                peca = document.createElement("div");
                peca.classList.add("peca");
                peca.classList.add(c < 3 ? "pecaPreta" : "pecaBranca");
                peca.classList.add("normal");


                if ((c < 3 && !bot) || c > 4) {
                    peca.addEventListener("click", () => pecaSelecionada(event));
                }

                document.querySelector(`.L${c}-${d}`).appendChild(peca);

                if (c < 3) {
                    contadorPecasPretas++
                }
                if (c > 4) {
                    contadorPecasBrancas++
                }

            } else {
                peca = ""
            }

            arrayTabuleiro[c][d] = peca;

        }

    }

    document.querySelector("#tabuleiro").style.display = "grid"

}

function pecaSelecionada(e) {
    let caminhosPossiveis = mostrarOpcoesMovimento(e.target);
    mostrarCaminhosPossiveis(caminhosPossiveis, e.target);
}

function mostrarOpcoesMovimento(elemento, ignorar = [-1, -1]) {

    let direcoes = [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1]
    ]

    let caminhosPossiveis = [];
    let idCaminhosComerPeca = [];
    let linha = parseInt(elemento.parentNode.classList[1].slice(1, 2))
    let coluna = parseInt(elemento.parentNode.classList[1].slice(3, 4))
    let corPeca = elemento.classList.contains("pecaBranca") ? "branca" : "preta";

    if (elemento.classList.contains("normal")) {

        for (let c = 0; c < 4; c++) {

            if (linha + direcoes[c][0] > 7 || linha + direcoes[c][0] < 0) {
                continue;
            }

            if (coluna + direcoes[c][1] > 7 || coluna + direcoes[c][1] < 0) {
                continue;
            }

            if (ignorar[0] != -1) {
                if (linha + direcoes[c][0] == ignorar[0] && coluna + direcoes[c][1] == ignorar[1]) {
                    continue;
                }
            }

            if (arrayTabuleiro[linha + direcoes[c][0]][coluna + direcoes[c][1]] != "") {
                if (arrayTabuleiro[linha + direcoes[c][0]][coluna + direcoes[c][1]].classList.contains(corPeca == "branca" ? "pecaPreta" : "pecaBranca")) {

                    if (linha + (direcoes[c][0] * 2) > 7 || linha + (direcoes[c][0] * 2) < 0) {
                        continue;
                    }

                    if (coluna + (direcoes[c][1] * 2) > 7 || coluna + (direcoes[c][1] * 2) < 0) {
                        continue;
                    }

                    if (!podeComerParaTras) {

                        if (direcoes[c][0] < 0 && corPeca == "preta") {
                            continue
                        }

                        if (direcoes[c][0] > 0 && corPeca == "branca") {
                            continue
                        }

                    }

                    if (arrayTabuleiro[linha + (direcoes[c][0] * 2)][coluna + (direcoes[c][1] * 2)] == "") {

                        let arrayComerSequencia = comerEmSequencia([linha, coluna], (elemento.classList.contains("normal") ? 'normal' : "dama"), copiarArray(arrayTabuleiro), corPeca)

                        if (arrayComerSequencia.length == 1) {
                            idCaminhosComerPeca.push(caminhosPossiveis.push([[linha + (direcoes[c][0] * 2), coluna + (direcoes[c][1] * 2)], [[linha + direcoes[c][0], coluna + direcoes[c][1]]]]) - 1)
                        } else {

                            for (let e = 0; e < arrayComerSequencia.length; e++) {
                                idCaminhosComerPeca.push(caminhosPossiveis.push(arrayComerSequencia[e]) - 1)
                            }

                        }


                        continue;
                    }




                }
            }

            if (direcoes[c][0] < 0 && corPeca == "preta") {
                continue
            }

            if (direcoes[c][0] > 0 && corPeca == "branca") {
                continue
            }

            if (arrayTabuleiro[linha + direcoes[c][0]][coluna + direcoes[c][1]] == "") {
                caminhosPossiveis.push([[linha + direcoes[c][0], coluna + direcoes[c][1]], []])
            }


        }

    } else if (elemento.classList.contains("dama")) {

        for (let c = 0; c < 4; c++) {
            let tempLinha = linha
            let tempColuna = coluna
            let achouPeca = false
            let pecasComidas = []
            let prePecaComica = []

            while (tempLinha < 8 && tempLinha >= 0 && tempColuna < 8 && tempColuna >= 0) {
                tempLinha += direcoes[c][0]
                tempColuna += direcoes[c][1]

                if (tempLinha > 7 || tempLinha < 0) {
                    continue;
                }

                if (tempColuna > 7 || tempColuna < 0) {
                    continue;
                }

                if (ignorar[0] != -1) {
                    if (tempLinha == ignorar[0] && tempColuna == ignorar[1]) {
                        continue;
                    }
                }

                if (arrayTabuleiro[tempLinha][tempColuna] == "" && achouPeca) {
                    achouPeca = false

                    pecasComidas.push([...prePecaComica])
                    // let arrayComerSequencia = comerEmSequencia([linha, coluna], (elemento.classList.contains("normal") ? 'normal' : "dama"), copiarArray(arrayTabuleiro), corPeca)
                    let arrayComerSequencia = [0]
                    if (arrayComerSequencia.length == 1) {
                        idCaminhosComerPeca.push(caminhosPossiveis.push([[tempLinha, tempColuna], copiarArray(pecasComidas)]) - 1)
                    } else {
                        for (let e = 0; e < arrayComerSequencia.length; e++) {
                            idCaminhosComerPeca.push(caminhosPossiveis.push(arrayComerSequencia[e]) - 1)
                        }

                    }


                    continue;
                }else if(achouPeca){
                    break;
                }


                if (arrayTabuleiro[tempLinha][tempColuna] != "") {

                    // break

                    // Logica de comer da dama
                    if (arrayTabuleiro[tempLinha][tempColuna].classList.contains(corPeca == "branca" ? "pecaPreta" : "pecaBranca")) {
                        achouPeca = true
                        prePecaComica = [tempLinha, tempColuna]
                    }else{
                        break
                    }
                }
                

                if (arrayTabuleiro[tempLinha][tempColuna] == "") {
                    caminhosPossiveis.push([[tempLinha, tempColuna], copiarArray(pecasComidas)])
                }


            }
        }




    }

    if (obrigatorioComer && idCaminhosComerPeca.length > 0) {

        let caminhosPossivelComer = []

        for (let c = 0; c < idCaminhosComerPeca.length; c++) {

            caminhosPossivelComer.push(caminhosPossiveis[idCaminhosComerPeca[c]])

        }

        return caminhosPossivelComer

    }

    return caminhosPossiveis

}

function mostrarCaminhosPossiveis(caminhosPossiveis, pecaSelecionada) {

    limparCaminhosAntigos();

    let pecaCaminhoPossivel;

    for (let c = 0; c < caminhosPossiveis.length; c++) {
        if (document.querySelector(`.L${caminhosPossiveis[c][0][0]}-${caminhosPossiveis[c][0][1]}`).children.length > 0) {
            continue;
        }
        pecaCaminhoPossivel = document.createElement("div")
        pecaCaminhoPossivel.classList.add("peca")
        pecaCaminhoPossivel.classList.add("caminho")
        pecaCaminhoPossivel.addEventListener('click', () => fazerMovimento([caminhosPossiveis[c][0], caminhosPossiveis[c][1]], pecaSelecionada));

        document.querySelector(`.L${caminhosPossiveis[c][0][0]}-${caminhosPossiveis[c][0][1]}`).appendChild(pecaCaminhoPossivel)

    }

}

function limparCaminhosAntigos() {
    document.querySelectorAll(".caminho").forEach(pecaCaminhoAntigo => {

        pecaCaminhoAntigo.remove();

    });
}

function fazerMovimento(destino, peca) {

    limparCaminhosAntigos();

    let linhaOrigem = parseInt(peca.parentNode.classList[1].slice(1, 2))
    let colunaOrigem = parseInt(peca.parentNode.classList[1].slice(3, 4))

    for (let c = 0; c < destino[1].length; c++) {

        if (destino[1][c][0] == 6 && peca.classList.contains("pecaPreta")) {
            peca.classList.remove("normal");
            peca.classList.add("dama");
        } else if (destino[1][c][0] == 1 && peca.classList.contains("pecaBranca")) {
            peca.classList.remove("normal");
            peca.classList.add("dama");
        }

    }

    if (peca.classList.contains("pecaBranca")) {

        if (destino[0][0] == 0) {
            peca.classList.remove("normal");
            peca.classList.add("dama");
        }

    } else {

        if (destino[0][0] == 7) {
            peca.classList.remove("normal");
            peca.classList.add("dama");
        }

    }
    for (let c = 0; c < destino[1].length; c++) {

        arrayTabuleiro[destino[1][c][0]][destino[1][c][1]] = ''

        

        if (peca.classList.contains("pecaBranca")) {

            contadorPecasPretas--

        } else {

            contadorPecasBrancas--

        }

        document.querySelector(`.L${destino[1][c][0]}-${destino[1][c][1]}`).innerHTML = ""

    }


    arrayTabuleiro[linhaOrigem][colunaOrigem] = "";
    arrayTabuleiro[destino[0][0]][destino[0][1]] = peca;

    document.querySelector(`.L${destino[0][0]}-${destino[0][1]}`).appendChild(peca)
    document.querySelector(`.L${linhaOrigem}-${colunaOrigem}`).innerHTML = ""

    mudarVez()

    if (contadorPecasBrancas == 0) {
        alert(bot ? "Você perdeu!" : "As peças pretas ganharam")
    } else if (contadorPecasPretas == 0) {
        alert(bot ? "Você ganhou!" : "As peças brancas ganharam")
    }

}

function comerEmSequencia(origem, tipoPeca, tabuleiroSimulacao, cor, pecasComidas = []) {

    let tempTabuleiroSimulacao = tabuleiroSimulacao
    let corInimiga = cor == "branca" ? "pecaPreta" : "pecaBranca"
    let arrayComerSequencia = [];

    if (tipoPeca == 'normal') {

        let direcoes = [
            [1, 1],
            [-1, 1],
            [-1, -1],
            [1, -1]
        ]

        for (let c = 0; c < 4; c++) {

            if (origem[0] + direcoes[c][0] > 7 || origem[0] + direcoes[c][0] < 0) {
                continue;
            }

            if (origem[1] + direcoes[c][1] > 7 || origem[1] + direcoes[c][1] < 0) {
                continue;
            }

            if (tempTabuleiroSimulacao[origem[0] + direcoes[c][0]][origem[1] + direcoes[c][1]] != "") {

                if (tempTabuleiroSimulacao[origem[0] + direcoes[c][0]][origem[1] + direcoes[c][1]].classList.contains(corInimiga)) {

                    if (origem[0] + (direcoes[c][0] * 2) > 7 || origem[0] + (direcoes[c][0] * 2) < 0) {
                        continue;
                    }

                    if (origem[1] + (direcoes[c][1] * 2) > 7 || origem[1] + (direcoes[c][1] * 2) < 0) {
                        continue;
                    }

                    if (tempTabuleiroSimulacao[origem[0] + (direcoes[c][0] * 2)][origem[1] + (direcoes[c][1] * 2)] == "") {


                        arrayComerSequencia.push([[origem[0] + (direcoes[c][0] * 2), origem[1] + (direcoes[c][1] * 2)], [[origem[0] + direcoes[c][0], origem[1] + direcoes[c][1]], ...pecasComidas]])

                        tempTabuleiroSimulacao[origem[0] + (direcoes[c][0] * 2)][origem[1] + (direcoes[c][1] * 2)] = tempTabuleiroSimulacao[origem[0]][origem[1]]

                        tempTabuleiroSimulacao[origem[0] + direcoes[c][0]][origem[1] + direcoes[c][1]] = ''

                        let tempArray = comerEmSequencia([origem[0] + (direcoes[c][0] * 2), origem[1] + (direcoes[c][1] * 2)], tipoPeca, tempTabuleiroSimulacao, cor, arrayComerSequencia[arrayComerSequencia.length - 1][1]);

                        if (tempArray.length > 0) {
                            for (let d = 0; d < tempArray.length; d++) {
                                arrayComerSequencia.push(tempArray[d])
                            }
                        }


                    }
                }
            }

        }

    }

    return arrayComerSequencia;

}

function mudarVez() {
    if (debug) return
    vezJogada = vezJogada == "preta" ? "branca" : "preta"
    let pecasBrancas = document.querySelectorAll(".pecaBranca")
    let pecasPretas = document.querySelectorAll(".pecaPreta")
    if (!bot) {
        pecasPretas.forEach(peca => {
            if (peca.classList.contains("injogavel")) {
                peca.classList.remove("injogavel")
            }
        })
    }

    pecasBrancas.forEach(peca => {
        if (peca.classList.contains("injogavel")) {
            peca.classList.remove("injogavel")
        }
    })

    if (vezJogada == "preta") {
        pecasBrancas.forEach(peca => {
            peca.classList.add("injogavel")
        })
    } else if (vezJogada == "branca") {
        pecasPretas.forEach(peca => {
            peca.classList.add("injogavel")
        })
    }
}

function copiarArray(array) {
    let copia = []
    array.forEach(elemento => {
        if (Array.isArray(elemento)) {
            copia.push(copiarArray(elemento))
        } else {
            copia.push(elemento)
        }
    })
    return copia;
}


function comoJogar() {
    document.querySelector("#menu").style.display = "none";
    document.querySelector("#comoJogar").style.display = "flex";
}

function voltarMenu() {
    document.querySelector("#comoJogar").style.display = "none";
    document.querySelector("#novoJogoConfig").style.display = "none";
    document.querySelector("#menu").style.display = "flex";
}

function novoJogoConfig() {
    document.querySelector("#menu").style.display = "none"
    document.querySelector("#novoJogoConfig").style.display = "flex";
}
