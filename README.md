# Microservices Architecture Playground

This project demonstrates production-grade client–server and microservices architecture patterns  
using Spring Boot, Spring Security, Resilience4j, and React.


## Architecture
- user-service (API Gateway)
- order-service (Downstream service)
- JWT-based authentication
- Stateless security
- Correlation IDs (MDC)

## Demonstrated Patterns
- JWT Authentication 
- RBAC
- Problem Details (RFC 7807)
- Correlation / Trace IDs
- Refresh Token Flow
- Rate Limiting
- Idempotency Keys
- Caching & Cache Invalidation
- Optimistic Locking
- Retry with Backoff
- Circuit Breaker

Each pattern can be triggered and observed via the UI dashboard.


## How to run the demos

This project includes a UI dashboard where each button opens a dedicated page demonstrating a production pattern.

### Services
- user-service: http://localhost:8081
- order-service: http://localhost:8082 
- client: http://localhost:3000
> **Note:** Shut down `order-service` to simulate downstream service failures (used for Retry and Circuit Breaker demos).


