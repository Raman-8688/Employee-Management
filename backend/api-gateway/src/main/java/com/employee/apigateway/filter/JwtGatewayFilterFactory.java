package com.employee.apigateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

@Component
public class JwtGatewayFilterFactory extends AbstractGatewayFilterFactory<JwtGatewayFilterFactory.Config> {

    private static final Logger log = LoggerFactory.getLogger(JwtGatewayFilterFactory.class);

    public JwtGatewayFilterFactory() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();

            // Bypass authentication endpoints
            if (path.contains("/auth/") || path.contains("/actuator/")) {
                return chain.filter(exchange);
            }

            // Log Authorization Header presence
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                log.warn("Missing Authorization Header for request path: {}", path);
            }

            return chain.filter(exchange);
        };
    }

    public static class Config {
        // Configuration properties if needed
    }
}
