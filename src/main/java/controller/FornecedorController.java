package controller;

import entities.Fornecedor;
import repository.FornecedorRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fornecedores")
@CrossOrigin(origins = "*")
public class FornecedorController {

    private final FornecedorRepository repository;

    public FornecedorController(FornecedorRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Fornecedor> listar() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Fornecedor> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Fornecedor> cadastrar(@Valid @RequestBody Fornecedor fornecedor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(fornecedor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Fornecedor> atualizar(@PathVariable Long id, @Valid @RequestBody Fornecedor dados) {
        return repository.findById(id).map(existente -> {
            existente.setRazaoSocial(dados.getRazaoSocial());
            existente.setCnpj(dados.getCnpj());
            existente.setTelefone(dados.getTelefone());
            existente.setEmail(dados.getEmail());
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