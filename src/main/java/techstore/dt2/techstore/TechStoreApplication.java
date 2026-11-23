package techstore.dt2.techstore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"techstore.dt2.techstore", "controller", "service", "config"})
@EntityScan(basePackages = {"entities"})
@EnableJpaRepositories(basePackages = {"repository"})
public class TechStoreApplication {
    public static void main(String[] args) {
        SpringApplication.run(TechStoreApplication.class, args);
    }
}