# inputTag

Um plugin para facilitar a utilização de tags em input separados por um delimitador.

## Dependências
O inputTag requer o [jQuery](http://jquery.com/)

## Utilização

O inputTag requer um input para sua utilização.

Código HTML:
```html
  <input type="text" id="inputtag" />
```

Código javascript:
```javascript
  $('#inputtag').inputTag({...});
```

## Opções
Você pode passar alguns parâmetros para adaptar o inputTag.

```javascript
  $('#inputtag').inputTag({
    max: -1,
    // Define o limite máximo de tag's que o input poderá receber.
    delimiter: ',',
    // Define o delimitador que separa a cadeia de caracteres.
    repeat: true,
    // Define se conterá cadeia de caracteres repetidas.
    onAddItem: function(text /* String */) {},
    // Define a função que é chamada logo após adicionar uma nova tag.
    onChange: function(value) {},
    // Define a função que é chamada logo após qualquer mudança no inputTag, o parâmetro corresponde ao value do input.
    addItemText: function(value) { return 'Aperte enter para adicionar <b>'+value+'</b>'}
    // Define a função que apresenta o texto para adicionar uma nova tag.
  });
```

## Observação
O resultado fica no value do input seletor.
Dessa forma, ao concluir a entrada de tag's você submete uma cadeia de caracteres separados pelo delimitador definido para o servidor.
Exemplo:
Código HTML:
```html
  <input type="text" name="tags" id="inputtag" />
```
Lado do servidor em PHP:
```php
<?php
  // ...
  // Se o submit vier de um post.
  $delimiter = ","; // O mesmo definido no javascript.
  $tags = explode(",", $_POST['tags']);
  foreach ($tags as $value) {
    # Tratamento.
  }
  // ...
?>
```
------------------------------------------------------------

Você pode inserir valores pré-definidos para buscar no dropdown pela tag `data-items` e separados por vírgula (,).
Exemplo:
Código HTML:
```html
  <input type="text" name="tags" id="inputtag" data-items="Brasil,França,Inglaterra"/>
```

## License

Esse código está sob a [MIT License](http://www.opensource.org/licenses/MIT).
