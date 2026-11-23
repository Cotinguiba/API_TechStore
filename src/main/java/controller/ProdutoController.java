package controller;

import entities.Produto;
import repository.CategoriaRepository;
import repository.FornecedorRepository;
import repository.ProdutoRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
@CrossOrigin(origins = "*")
public class ProdutoController {

    private final ProdutoRepository repository;
    private final CategoriaRepository categoriaRepo;
    private final FornecedorRepository fornecedorRepo;

    public ProdutoController(ProdutoRepository repository, CategoriaRepository categoriaRepo, FornecedorRepository fornecedorRepo) {
        this.repository = repository;
        this.categoriaRepo = categoriaRepo;
        this.fornecedorRepo = fornecedorRepo;
    }

    @GetMapping
    public List<Produto> listar() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Produto> cadastrar(@Valid @RequestBody Produto produto) {
        var cat = categoriaRepo.findById(produto.getCategoria().getId())
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada."));
        var forn = fornecedorRepo.findById(produto.getFornecedor().getId())
                .orElseThrow(() -> new IllegalArgumentException("Fornecedor não encontrado."));
        produto.setCategoria(cat);
        produto.setFornecedor(forn);
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(produto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizar(@PathVariable Long id, @Valid @RequestBody Produto dados) {
        return repository.findById(id).map(existente -> {
            var cat = categoriaRepo.findById(dados.getCategoria().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada."));
            var forn = fornecedorRepo.findById(dados.getFornecedor().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Fornecedor não encontrado."));
            existente.setNome(dados.getNome());
            existente.setCodigoSku(dados.getCodigoSku());
            existente.setPreco(dados.getPreco());
            existente.setEstoque(dados.getEstoque());
            existente.setCategoria(cat);
            existente.setFornecedor(forn);
            return ResponseEntity.ok(repository.save(existente));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}