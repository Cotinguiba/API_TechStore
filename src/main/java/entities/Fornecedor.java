package entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "fornecedores")
public class Fornecedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "A razão social é obrigatória")
    @Column(nullable = false)
    private String razaoSocial;

    @NotBlank(message = "O CNPJ é obrigatório")
    @Column(nullable = false, unique = true)
    private String cnpj;

    @NotBlank(message = "O telefone é obrigatório")
    private String telefone;

    @Email(message = "E-mail inválido")
    @NotBlank(message = "O e-mail é obrigatório")
    private String email;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRazaoSocial() { return razaoSocial; }
    public void setRazaoSocial(String razaoSocial) { this.razaoSocial = razaoSocial; }

    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}