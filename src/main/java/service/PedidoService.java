package service;

import entities.Cliente;
import entities.Pedido;
import entities.Produto;
import repository.ClienteRepository;
import repository.PedidoRepository;
import repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepo;
    private final ProdutoRepository produtoRepo;
    private final ClienteRepository clienteRepo;

    public PedidoService(PedidoRepository pedidoRepo, ProdutoRepository produtoRepo, ClienteRepository clienteRepo) {
        this.pedidoRepo = pedidoRepo;
        this.produtoRepo = produtoRepo;
        this.clienteRepo = clienteRepo;
    }

    @Transactional
    public Pedido criarPedido(Pedido dados) {
        Cliente cliente = clienteRepo.findById(dados.getCliente().getId())
                .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado."));

        Produto produto = produtoRepo.findById(dados.getProduto().getId())
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado."));

        if (produto.getEstoque() < dados.getQuantidade()) {
            throw new IllegalArgumentException("Estoque insuficiente. Disponível: " + produto.getEstoque());
        }

        produto.setEstoque(produto.getEstoque() - dados.getQuantidade());
        produtoRepo.save(produto);

        dados.setCliente(cliente);
        dados.setProduto(produto);
        dados.setDataPedido(LocalDate.now());
        dados.setValorTotal(produto.getPreco().multiply(BigDecimal.valueOf(dados.getQuantidade())));

        return pedidoRepo.save(dados);
    }
}