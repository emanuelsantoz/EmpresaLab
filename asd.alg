algoritmo "exercicio_dois"
var
  entradas_usuario: vetor [1..10] de inteiro
  i, menorValor, maiorValor: inteiro
  
inicio
      menorValor <- 10
      maiorValor <- 0
      para i de 1 ate 10 faca
           escreval("Informe o", i, "º: ")
           leia(entradas_usuario[i])

           se menorValor >= entradas_usuario[i] entao
                menorValor <- entradas_usuario[i]
           fimse

           se(maiorValor <= entradas_usuario[i]) entao
                maiorValor <- entradas_usuario[i]
           fimse
      fimpara

             escreval("O menor valor é: ", menorValor)
             escreval("O maior valor é: ", maiorValor)
fimalgoritmo

// aça um algoritmo que apresente a tabuada de um número definido pelo usuário. Desafio: mostre de uma vez só, todas as tabuadas do 1 ao 10