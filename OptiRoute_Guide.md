# 🚀 OptiRoute — Complete Interview Preparation Guide

> **How to use this guide:** Read each section out loud. Practice answering as if the interviewer just asked you. Every answer below is written in first-person — exactly how YOU should speak.

---

## 1. Project Introduction

### "Tell me about your project."

> **"My project is called OptiRoute.** It is a smart travel route optimization platform that helps users find the best route between two cities by comparing multiple transport options — flights, trains, and buses.
>
> The **problem statement** is: when people want to travel from one city to another, they have to manually search across many platforms to compare prices and travel times. There is no single place that recommends the most efficient route by balancing both cost and time.
>
> **Why was this project needed?** I wanted to build a system that takes a source and destination, fetches all available direct routes, and then recommends the best one based on an **efficiency score** — a weighted formula that considers both duration (60%) and cost (40%).
>
> **Who uses it?** There are two types of users:
> 1. **End Users** — they search routes, view suggestions, book travel, and manage their profiles.
> 2. **Admins** — they manage locations, add/delete routes, assign operators, and manage all users.
>
> **Tech stack:** Java 17, Spring Boot 3.2, Spring Security with JWT, MySQL 8.0, React.js frontend, Docker for containerization, and Axios for API communication."

---

## 2. Architecture Flow

### "Explain the architecture and request flow."

> "My project follows a **three-tier architecture**: Frontend → Backend → Database.
>
> **Request flow step by step:**
> 1. The user interacts with the **React frontend** (login, search routes, etc.)
> 2. React uses **Axios** to send an HTTP request to the Spring Boot backend at `http://localhost:8080/api/...`
> 3. Every request passes through the **Axios interceptor**, which automatically attaches the JWT token from `localStorage` in the `Authorization: Bearer <token>` header.
> 4. The request hits the **Spring Security filter chain**. My custom `JwtAuthenticationFilter` (extends `OncePerRequestFilter`) intercepts it:
>    - For `/api/auth/*` paths → the filter is bypassed (login/register are public)
>    - For all other paths → the filter extracts the token, validates it, loads user details, and sets the `SecurityContext`
> 5. The request reaches the appropriate **Controller** (e.g., `RouteController`, `AuthController`, `AdminController`)
> 6. The controller delegates business logic to the **Service layer** (e.g., `RouteService`, `UserService`, `AdminService`)
> 7. The service layer calls the **Repository layer** (e.g., `DirectRouteRepository`, `UserRepository`) which extends `JpaRepository`
> 8. JPA/Hibernate translates the method calls into **SQL queries** and interacts with the **MySQL database**
> 9. The response travels back: Repository → Service → Controller → JSON Response → React Frontend"

### "How does REST API work in your project?"

> "I use **RESTful conventions** throughout:
>
> | HTTP Method | Example Endpoint | Purpose |
> |---|---|---|
> | `POST` | `/api/auth/login` | User login |
> | `POST` | `/api/auth/register` | User registration |
> | `GET` | `/api/routes/suggest?from=X&to=Y` | Get route suggestions |
> | `GET` | `/api/admin/users` | Admin gets all users |
> | `POST` | `/api/admin/routes` | Admin adds a route |
> | `DELETE` | `/api/admin/routes/{id}` | Admin deletes a route |
> | `PUT` | `/api/admin/routes/{id}/operator` | Admin assigns operator |
> | `GET` | `/api/user/profile` | Get logged-in user's profile |
> | `PUT` | `/api/user/profile` | Update profile |
> | `DELETE` | `/api/user/profile` | Delete account |
>
> I use `@RestController`, `@RequestMapping`, `@GetMapping`, `@PostMapping`, `@PutMapping`, and `@DeleteMapping` annotations. Request bodies are deserialized using `@RequestBody` and path variables using `@PathVariable`."

---

## 3. Why Spring Boot?

### "Why did you choose Spring Boot and not plain Java?"

> "In plain Java, if I wanted to build a REST API, I would have to:
> - Manually configure a servlet container (Tomcat)
> - Write JDBC boilerplate for every database query
> - Handle JSON serialization/deserialization manually
> - Manage dependency injection manually
> - Configure security from scratch
>
> **Spring Boot gave me all of this out-of-the-box:**
>
> | Feature | Plain Java | Spring Boot |
> |---|---|---|
> | Embedded server | Configure Tomcat manually | `spring-boot-starter-web` auto-configures it |
> | Database access | Raw JDBC, connection pools | `spring-boot-starter-data-jpa` + Hibernate |
> | Security | Custom filter implementations | `spring-boot-starter-security` + JWT |
> | Configuration | XML files everywhere | Single `application.yml` |
> | Dependency Injection | Manual object management | `@Autowired`, `@Service`, `@Component` |
> | REST APIs | Servlets + manual routing | `@RestController` + `@GetMapping` etc. |
>
> **Specific advantages in my project:**
> 1. **Auto-configuration** — Spring Boot auto-detected MySQL driver and configured the DataSource
> 2. **Starter dependencies** — I just added `spring-boot-starter-security` and got the full security filter chain
> 3. **JPA Repositories** — I wrote zero SQL for basic CRUD; just extended `JpaRepository<DirectRoute, Long>`
> 4. **Lombok** — Reduced boilerplate with `@Data` for getters/setters
> 5. **Docker-ready** — Spring Boot produces a single JAR file, perfect for containerization"

---

## 4. JWT Authentication

### "Why did you use JWT?"

> "My application is a **stateless REST API**. I don't maintain server-side sessions. JWT allows me to authenticate users without storing any session data on the server. The token itself carries the user identity and role."

### "How does login work in your project?"

> "Here's the exact flow:
>
> 1. User submits email and password from the React login page
> 2. React sends a `POST /api/auth/login` request with `{ username, password }`
> 3. The `AuthController` receives it and calls `UserService.login()`
> 4. `UserService` uses Spring's `AuthenticationManager.authenticate()` which internally calls my `CustomUserDetailsService.loadUserByUsername()`
> 5. `CustomUserDetailsService` checks **both** the `admins` table and the `users` table. If found in `admins`, it assigns `ROLE_ADMIN`; if found in `users`, it assigns `ROLE_USER`
> 6. Passwords are verified using **BCrypt** (`BCryptPasswordEncoder`) — I never store plain-text passwords
> 7. On successful authentication, `JwtTokenProvider.generateToken()` creates a JWT signed with **HS512 algorithm**
> 8. The token is returned in a `JwtResponse` object containing `{ token, role }`
> 9. React stores the token in `localStorage` and uses the Axios interceptor to send it with every subsequent request"

### "How is the token generated?"

> "I use the **JJWT library** (io.jsonwebtoken). The token is built like this:
>
> ```java
> Jwts.builder()
>     .setSubject(username)      // who is this token for
>     .setIssuedAt(new Date())   // when was it created
>     .setExpiration(expiryDate) // 24 hours (86400000 ms)
>     .signWith(getKey(), SignatureAlgorithm.HS512)  // signed with secret key
>     .compact();
> ```
>
> The secret key is stored in `application.yml` and injected via `@Value(\"${jwt.secret}\")`. For admin tokens, I also include a `role` claim using `.claim(\"role\", \"ROLE_ADMIN\")`."

### "How is the token validated on each request?"

> "I have a custom filter called `JwtAuthenticationFilter` that extends `OncePerRequestFilter`. On every request:
>
> 1. It extracts the token from the `Authorization` header (strips the `Bearer ` prefix)
> 2. Calls `JwtTokenProvider.validateToken()` which parses the token and checks signature + expiration
> 3. If valid, it extracts the username, loads `UserDetails`, and sets `SecurityContextHolder`
> 4. If invalid or missing, the request continues without authentication (Spring Security will block it if the endpoint requires auth)"

### "Why is JWT better than session-based auth?"

> | Feature | Session-Based | JWT |
> |---|---|---|
> | Server storage | Session stored on server (memory/Redis) | Nothing stored on server — **stateless** |
> | Scalability | Sticky sessions needed across servers | Any server can validate the token |
> | Mobile-friendly | Cookies don't work well on mobile | Token sent in header — works everywhere |
> | CORS | Cookie issues with cross-origin | No cookie issues |
> | Performance | DB/cache lookup on each request | Token is self-contained, verified in memory |
>
> In my OptiRoute project, since I deploy using Docker containers, **stateless JWT is essential** — I don't have to worry about session replication across containers."

---

## 5. Database Design

### "Explain your database tables and relationships."

> "I have **4 main tables** in MySQL:
>
> | Table | Primary Key | Key Columns | Constraints |
> |---|---|---|---|
> | `users` | `id` (auto-increment) | username, email, password, mobile_number, security_question, security_answer | email UNIQUE, username UNIQUE |
> | `admins` | `id` (auto-increment) | username, email, password, mobile_number | username UNIQUE, email UNIQUE |
> | `locations` | `id` (auto-increment) | name, type (ENUM: CITY, AIRPORT, STATION) | name UNIQUE |
> | `direct_routes` | `id` (auto-increment) | from_location_id, to_location_id, transport_type, duration_minutes, cost, operator, date | FKs to locations |

### "What relationships exist?"

> "The key relationship is between `direct_routes` and `locations`:
>
> ```
> locations (1) ───────< (M) direct_routes.from_location_id
> locations (1) ───────< (M) direct_routes.to_location_id
> ```
>
> This is a **Many-to-One** relationship — many routes can start from the same location, and many routes can end at the same location. In JPA, I use:
>
> ```java
> @ManyToOne
> @JoinColumn(name = "from_location_id", nullable = false)
> private Location fromLocation;
>
> @ManyToOne
> @JoinColumn(name = "to_location_id", nullable = false)
> private Location toLocation;
> ```
>
> **Primary Keys:** Every table uses `@GeneratedValue(strategy = GenerationType.IDENTITY)` — MySQL auto-increment.
>
> **Foreign Keys:** `from_location_id` and `to_location_id` in `direct_routes` reference the `id` column in `locations`."

### "What indexing have you used and why?"

> "I use indexing in the following ways:
>
> 1. **Primary key index** — automatically created on `id` columns by MySQL
> 2. **Unique index on `email`** in `users` table — enforced via `@UniqueConstraint(columnNames = {\"email\"})`. This prevents duplicate registrations and speeds up login lookups.
> 3. **Unique index on `name`** in `locations` table — ensures no duplicate city names and makes `findByNameIgnoreCase()` queries faster.
> 4. **Foreign key indexes** on `from_location_id` and `to_location_id` — MySQL automatically creates indexes on FK columns, which speeds up the core query: `findByFromLocationAndToLocation()`.
>
> **Why indexing matters:** Without the index on `from_location_id` and `to_location_id`, every route search would do a full table scan. With indexes, MySQL uses B-Tree lookup, reducing search time from O(n) to O(log n)."

---

## 6. SQL in My Project

### JOIN (INNER JOIN)

> **Interviewer: "Give me a SQL join example from your project."**
>
> "When I search routes from 'New York' to 'London', the system needs to join `direct_routes` with `locations` to get city names:
>
> ```sql
> SELECT dr.id, l1.name AS from_city, l2.name AS to_city,
>        dr.transport_type, dr.duration_minutes, dr.cost
> FROM direct_routes dr
> INNER JOIN locations l1 ON dr.from_location_id = l1.id
> INNER JOIN locations l2 ON dr.to_location_id = l2.id
> WHERE l1.name = 'New York' AND l2.name = 'London';
> ```
>
> This returns only routes where **both** source and destination locations exist."

### LEFT JOIN

> "If I want to see all locations, even those with no routes yet:
>
> ```sql
> SELECT l.name, COUNT(dr.id) AS route_count
> FROM locations l
> LEFT JOIN direct_routes dr ON l.id = dr.from_location_id
> GROUP BY l.name;
> ```
>
> This returns all locations. Cities like 'Sydney' that have no outbound routes will still appear with `route_count = 0`."

### GROUP BY

> "To see the total routes available per transport type:
>
> ```sql
> SELECT transport_type, COUNT(*) AS total_routes, AVG(cost) AS avg_cost
> FROM direct_routes
> GROUP BY transport_type;
> ```
>
> Result: FLIGHT → 4 routes, avg ₹562 | TRAIN → 1 route | BUS → 1 route"

### ORDER BY

> "To get the cheapest routes first:
>
> ```sql
> SELECT * FROM direct_routes
> ORDER BY cost ASC, duration_minutes ASC;
> ```
>
> This first sorts by cost, and if two routes have the same cost, sorts by duration."

### HAVING

> "To find transport types where the average cost exceeds ₹200:
>
> ```sql
> SELECT transport_type, AVG(cost) AS avg_cost
> FROM direct_routes
> GROUP BY transport_type
> HAVING AVG(cost) > 200;
> ```
>
> `HAVING` filters **after** grouping — unlike `WHERE`, which filters before grouping."

### Window Function

> "To rank routes by cost within each route pair:
>
> ```sql
> SELECT id, from_location_id, to_location_id, transport_type, cost,
>        RANK() OVER (PARTITION BY from_location_id, to_location_id ORDER BY cost ASC) AS cost_rank
> FROM direct_routes;
> ```
>
> This ranks routes for New York → London separately from London → Paris, etc. I can then filter `WHERE cost_rank = 1` to get the cheapest route per pair."

### Pagination Query

> "For the admin dashboard where we list all routes with pagination:
>
> ```sql
> SELECT dr.*, l1.name AS from_city, l2.name AS to_city
> FROM direct_routes dr
> JOIN locations l1 ON dr.from_location_id = l1.id
> JOIN locations l2 ON dr.to_location_id = l2.id
> ORDER BY dr.id
> LIMIT 10 OFFSET 20;   -- Page 3 (0-indexed), 10 items per page
> ```
>
> In Spring Boot, this is handled by Spring Data JPA's `Pageable`:
> ```java
> Page<DirectRoute> findAll(Pageable pageable);
> // Called as: routeRepository.findAll(PageRequest.of(pageNo, pageSize));
> ```"

---

## 7. Data Mocking

### "Why did you use data mocking?"

> "In our project, the frontend and backend were being developed **in parallel**. The frontend team needed route data and user data to build and test the UI, but the backend APIs weren't fully ready yet.
>
> So we used **data mocking (seeding)** via a `data.sql` file that Spring Boot automatically executes on startup. It inserts sample data:
> - A default **user** (`user@gmail.com` / `password`)
> - A default **admin** (`admin@gmail.com` / `password`)
> - **7 locations** (New York, London, Paris, Tokyo, Sydney, JFK Airport, Heathrow Airport)
> - **7 direct routes** with realistic costs and durations
>
> We also configured `spring.sql.init.mode: always` and `jpa.defer-datasource-initialization: true` so that tables are created first by Hibernate, and then `data.sql` runs to populate seed data."

### "What tools did you use?"

> "1. **`data.sql`** — Spring Boot's native SQL init script for seeding the database
> 2. **`INSERT IGNORE INTO`** — MySQL syntax to avoid duplicate key errors on restart
> 3. **BCrypt pre-hashed passwords** — even mock data uses hashed passwords (not plain text) for security
> 4. On the frontend, before the API was ready, we used **hardcoded JSON responses** in the React service files for UI testing"

### "What was the benefit?"

> "The frontend team could develop and test independently. They didn't have to wait for backend APIs. We just agreed on the **API contract** (request/response format) upfront, and frontend mocked those responses. Once backend was ready, we simply switched from mock data to real API calls via Axios. This saved at least 1-2 weeks of blocked development time."

---

## 8. Challenges Faced

### Challenge 1: Slow Route Query

> "When I first searched routes, the query was slow because it was doing a **full table scan** on `direct_routes`. With thousands of routes, the response time went above 2 seconds."

### Challenge 2: Duplicate Route Data

> "When the application restarted, `data.sql` tried to insert the same seed data again, causing **duplicate key errors** and sometimes creating duplicate routes that showed up in search results."

### Challenge 3: JWT Token Expiry

> "Users were suddenly getting **403 Forbidden** errors after using the app for a long time. The frontend was still sending the old token, but it had expired."

### Challenge 4: API Response Delay (CORS Issue)

> "The React frontend was making API calls, but the browser was blocking them with a **CORS error** — `No 'Access-Control-Allow-Origin' header is present`. The API wasn't even being hit. Preflight `OPTIONS` requests were being rejected."

### Challenge 5: Admin Login Not Working Separately

> "Initially, both user and admin were logging in through the same `/api/auth/login` endpoint. But the `CustomUserDetailsService` was only checking the `users` table, so admin login always failed."

---

## 9. How I Solved the Challenges

### Solution 1: Indexing on Foreign Keys

> "I added indexes on `from_location_id` and `to_location_id` in the `direct_routes` table. MySQL automatically creates indexes on foreign key columns with JPA `@JoinColumn`. Query time dropped from **~2 seconds to ~50ms**."

### Solution 2: INSERT IGNORE + Deduplication Logic

> "I used `INSERT IGNORE INTO` in `data.sql` to prevent duplicate key errors on restart. Additionally, in `RouteService`, I added **deduplication logic** using a `Set<String>` to filter duplicate routes before returning results:
>
> ```java
> Set<String> seenKeys = new HashSet<>();
> options = options.stream()
>     .filter(opt -> {
>         String key = opt.getTransportType() + "-" + opt.getDurationMinutes() + "-" + opt.getCost();
>         return seenKeys.add(key);
>     })
>     .collect(Collectors.toList());
> ```"

### Solution 3: Token Expiry Handling

> "I configured the token expiration to **24 hours** (`86400000 ms`). On the frontend, the Axios interceptor checks for `401/403` responses. When detected, it clears `localStorage` and redirects to the login page, asking the user to re-authenticate."

### Solution 4: CORS Configuration

> "I created a proper `CorsConfigurationSource` bean in `SecurityConfig`:
>
> ```java
> configuration.setAllowedOrigins(List.of("http://localhost:3001"));
> configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
> configuration.setAllowedHeaders(List.of("*"));
> configuration.setAllowCredentials(true);
> ```
>
> I also whitelisted `OPTIONS /**` requests in `authorizeHttpRequests` to allow preflight requests through."

### Solution 5: Dual Login Flow

> "I updated `CustomUserDetailsService` to check **both** `AdminRepository` and `UserRepository`. It first checks admin by username, then by email, then checks user by email. I also created a separate `/api/admin/login` endpoint that calls `AdminService.login()` and returns a token with `ROLE_ADMIN` claim."

---

## 10. Performance Optimization

### Pagination

> "For endpoints that return large lists (like admin listing all routes or users), I use **Spring Data JPA pagination**:
>
> ```java
> Page<DirectRoute> routes = routeRepository.findAll(PageRequest.of(page, size));
> ```
>
> Instead of loading 10,000 routes into memory, I load only 10 or 20 at a time. The SQL generated is `LIMIT 10 OFFSET 20`, which is very efficient."

### Indexing

> "I have indexes on:
> - `users.email` — speeds up login (email lookup)
> - `locations.name` — speeds up `findByNameIgnoreCase()` during route search
> - `direct_routes.from_location_id` and `to_location_id` — speeds up the core route search query
>
> Without these, every query would be a **full table scan** (O(n)). With B-Tree indexes, it's **O(log n)**."

### Deduplication in Service Layer

> "Rather than relying on database constraints alone to handle duplicates, I also deduplicate in Java using a `HashSet` keyed on `transportType + duration + cost`. This ensures the API response is always clean, even if the database has slight inconsistencies."

### Efficiency Scoring Algorithm

> "Instead of returning all routes unsorted, I calculate an **efficiency score** for every route:
>
> ```java
> efficiencyScore = (durationMinutes * 0.6) + (cost * 0.4);
> ```
>
> Routes are sorted by this score, and the best one is highlighted. This processing happens **in memory** after the DB query, so it doesn't add DB load."

### Stateless Session (No Server Memory for Sessions)

> "By using `SessionCreationPolicy.STATELESS`, Spring Security never creates HTTP sessions. This means **zero server memory** is used for user sessions — essential for Docker deployment where containers can scale independently."

---

## 11. API Questions Interviewer Can Ask

### Q1: "What is the difference between `@Controller` and `@RestController`?"

> "**`@Controller`** returns a View (like an HTML page). **`@RestController`** = `@Controller` + `@ResponseBody`. It automatically serializes the return value into JSON. In my project, I use `@RestController` everywhere because I'm building REST APIs that return JSON."

### Q2: "What is the difference between `@RequestBody` and `@RequestParam`?"

> "`@RequestBody` binds the entire HTTP request body to a Java object (used in POST/PUT with JSON body). `@RequestParam` extracts a single query parameter from the URL. For example:
> - `POST /api/auth/login` uses `@RequestBody LoginRequest` to read `{ email, password }`
> - `GET /api/routes/suggest?from=X&to=Y` uses `@RequestParam String from`"

### Q3: "What happens if an API endpoint throws an exception?"

> "If I don't handle it, Spring Boot returns a **500 Internal Server Error**. In my project, I wrap service calls in try-catch blocks in the controller. For example, invalid login returns `401`, duplicate registration returns `400 Bad Request`. I return meaningful error messages to the frontend."

### Q4: "How do you version your APIs?"

> "Currently, all my APIs are under `/api/`. If I needed versioning, I would use URL-based versioning: `/api/v1/routes/suggest` and `/api/v2/routes/suggest`. Spring Boot makes this easy with `@RequestMapping(\"/api/v1\")`."

### Q5: "What is `ResponseEntity` and why do you use it?"

> "`ResponseEntity<T>` represents the **entire HTTP response** — status code, headers, and body. I use it to control exact HTTP status codes:
> - `ResponseEntity.ok(data)` → returns 200
> - `ResponseEntity.status(401).body(\"Invalid credentials\")` → returns 401
> - `ResponseEntity.badRequest().body(msg)` → returns 400"

### Q6: "How does your API handle authentication for different roles?"

> "In `SecurityConfig`, I define authorization rules:
> - `/api/auth/register`, `/api/auth/login`, `/api/admin/login` → `permitAll()` (no auth needed)
> - `/api/routes/**` → `permitAll()` (public route search)
> - Everything else → `authenticated()` (must have valid JWT)
>
> Admin-specific actions are in `/api/admin/*`, and the admin token includes `ROLE_ADMIN` claim, which my `CustomUserDetailsService` assigns."

---

## 12. Database Questions Interviewer Can Ask

### Q1: "What is the difference between `DELETE`, `TRUNCATE`, and `DROP`?"

> "**`DELETE`** removes specific rows (can use WHERE), is logged/transaction-safe, triggers fire. **`TRUNCATE`** removes ALL rows, faster, resets auto-increment, no triggers. **`DROP`** removes the entire table structure. In my project, I use `DELETE FROM users WHERE username = 'admin'` in `data.sql` to reset seed data."

### Q2: "What is normalization? Is your database normalized?"

> "Normalization reduces data redundancy. My database is in **3NF (Third Normal Form)**:
> - Locations are in a separate table (no repeating city names in routes)
> - Routes reference locations via foreign keys
> - No transitive dependencies — every non-key column depends only on the primary key"

### Q3: "What is the difference between `WHERE` and `HAVING`?"

> "**`WHERE`** filters rows **before** grouping. **`HAVING`** filters groups **after** `GROUP BY`. Example: I can filter routes by transport type first (`WHERE transport_type = 'FLIGHT'`), or I can group all routes and then filter groups with average cost above ₹200 (`HAVING AVG(cost) > 200`)."

### Q4: "When would you use an index, and when not?"

> "**Use:** On columns frequently used in `WHERE`, `JOIN`, `ORDER BY` — like `email` in my users table or `from_location_id` in routes. **Don't use:** On columns that are rarely queried, have very low cardinality (like boolean), or on small tables where a full scan is fast enough. Indexes slow down `INSERT`/`UPDATE`/`DELETE` because the index must also be updated."

### Q5: "What is a composite index? Would your project benefit from one?"

> "A composite index is on multiple columns. For my route search, a composite index on `(from_location_id, to_location_id)` would be very useful — it directly supports `findByFromLocationAndToLocation()`. MySQL can use this single index for both the WHERE conditions instead of two separate index lookups."

### Q6: "Explain ACID properties with an example from your project."

> "When a user registers:
> - **Atomicity:** Either the user is fully saved, or nothing is saved (no half-inserts)
> - **Consistency:** After the insert, the unique email constraint is maintained
> - **Isolation:** Two users registering at the same time don't interfere with each other
> - **Durability:** Once committed, the data persists even if the server crashes"

---

## 13. Spring Boot Cross Questions

### Q1: "What is `@Autowired`? How does DI work?"

> "**`@Autowired`** tells Spring to **inject** a dependency automatically. Spring creates a bean (object) and injects it where needed. In my project, `UserService` has `@Autowired private UserRepository userRepository;` — Spring creates the repository proxy and injects it. This is **Dependency Injection (DI)**. I use **constructor injection** in `SecurityConfig` and **field injection** elsewhere."

### Q2: "What is the difference between `@Component`, `@Service`, and `@Repository`?"

> "All three are **stereotype annotations** — they all tell Spring to create a bean. The difference is semantic:
> - `@Component` — generic
> - `@Service` — business logic layer (like `RouteService`)
> - `@Repository` — data access layer (like `DirectRouteRepository`) — also enables JPA exception translation"

### Q3: "What is `OncePerRequestFilter`? Why did you use it?"

> "It's a Spring filter that guarantees the filter runs **exactly once per request** — even if the request is forwarded internally. My `JwtAuthenticationFilter` extends it because I don't want to validate the JWT token twice if there's an internal forward."

### Q4: "What does `ddl-auto: update` mean? Would you use it in production?"

> "It means Hibernate will **automatically create or alter tables** to match entity classes. Great for development. In **production**, I would set it to `validate` (only checks schema, never changes it) and use **Flyway or Liquibase** for migration scripts."

### Q5: "Explain `@ManyToOne` and `@JoinColumn` in your project."

> "In `DirectRoute`:
> ```java
> @ManyToOne
> @JoinColumn(name = "from_location_id", nullable = false)
> private Location fromLocation;
> ```
> `@ManyToOne` means many routes can be associated with one location. `@JoinColumn` specifies that the `from_location_id` column in `direct_routes` table is the foreign key referencing `locations.id`. JPA handles the join automatically when I call `route.getFromLocation().getName()`."

### Q6: "What is the N+1 problem? Does your project have it?"

> "The N+1 problem is when fetching a list of N routes makes 1 query for routes + N additional queries to load each location. Yes, my project could face this in `findAll()` for routes. **Solution:** Use `@EntityGraph` or `JOIN FETCH` in JPQL:
> ```java
> @Query(\"SELECT r FROM DirectRoute r JOIN FETCH r.fromLocation JOIN FETCH r.toLocation\")
> List<DirectRoute> findAllWithLocations();
> ```
> This fetches everything in a single SQL query."

### Q7: "How does Spring Security filter chain work?"

> "Spring Security uses a **filter chain** — a series of filters that run before the request reaches the controller:
> 1. `CorsFilter` — handles CORS headers
> 2. `CsrfFilter` — I disable this (stateless API)
> 3. **`JwtAuthenticationFilter`** (my custom filter) — validates JWT
> 4. `UsernamePasswordAuthenticationFilter` — (default, I add mine before this)
> 5. `ExceptionTranslationFilter` — converts auth exceptions to 401/403
> 6. `FilterSecurityInterceptor` — checks authorization rules
>
> I register my filter using: `addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)`"

### Q8: "What happens if the JWT secret key is compromised?"

> "An attacker could **forge tokens** with any username or role, including `ROLE_ADMIN`. Mitigation:
> 1. Store the secret in **environment variables**, not in code (I use `${JWT_SECRET}` in `application.yml`)
> 2. Rotate the secret periodically (all existing tokens become invalid)
> 3. In production, use **asymmetric keys (RS256)** instead of symmetric HS512"

---

## 14. HR-style Scenario Questions

### Q1: "Tell me about a time you faced a challenge in your project."

> "When we first deployed OptiRoute with Docker, the backend container started before MySQL was fully ready, causing connection failures. I solved this by adding a **healthcheck** with `mysqladmin ping` and `depends_on: condition: service_healthy` in `docker-compose.yml`. This taught me that in distributed systems, services don't start simultaneously — you must handle **startup ordering**."

### Q2: "What would you do if a production API is returning slow responses?"

> "Step 1: Check **logs** for error patterns. Step 2: Use `EXPLAIN` on the SQL query to check if indexes are being used. Step 3: Enable `spring.jpa.show-sql: true` to see the generated queries. Step 4: Add missing indexes. Step 5: If it's an N+1 problem, add `JOIN FETCH`. Step 6: If data volume is the issue, implement **pagination**. In my project, I implemented all of these proactively."

### Q3: "How did your team collaborate on this project?"

> "We had a **clear separation**: backend team worked on Spring Boot APIs, frontend team worked on React. We agreed on the **API contract** early — request/response JSON format. Frontend used **mock data** while backend was under development. We used **Docker Compose** for consistent environments so everyone had the same setup."

### Q4: "If you had more time, what would you improve?"

> "1. **Add Redis caching** for frequently searched routes (e.g., Mumbai → Delhi)
> 2. Implement **role-based API authorization** with `@PreAuthorize(\"hasRole('ADMIN')\")`
> 3. Add **Swagger/OpenAPI documentation** using `springdoc-openapi`
> 4. Write **unit tests** using JUnit 5 and Mockito
> 5. Implement **multi-leg route optimization** (e.g., New York → Paris via London using Dijkstra's algorithm)
> 6. Add **email notifications** for booking confirmations
> 7. Deploy on **AWS** with EC2, RDS for MySQL, and S3 for static frontend"

### Q5: "Why should we hire you for this role?"

> "Through OptiRoute, I have **hands-on experience** with the core skills: Spring Boot REST APIs, JWT-based security, MySQL database design with proper indexing and normalization, Docker containerization, and React frontend integration. I don't just use these tools — I understand *why* they work. When I faced a CORS issue, I didn't just copy-paste a solution — I configured `CorsConfigurationSource` properly. When queries were slow, I analyzed the execution plan and added indexes. I'm eager to apply this practical knowledge to real-world production systems."

---

## Quick Reference: Tech Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| Language | Java 17 | Backend logic |
| Framework | Spring Boot 3.2.3 | Auto-config, DI, starters |
| Security | Spring Security + JWT (HS512) | Authentication & authorization |
| Database | MySQL 8.0 | Data persistence |
| ORM | Hibernate / Spring Data JPA | Object-relational mapping |
| Build Tool | Maven | Dependency management |
| Password Hashing | BCrypt | Secure password storage |
| Frontend | React.js + Axios | User interface |
| Containerization | Docker + Docker Compose | Deployment |
| Code Reduction | Lombok (`@Data`, `@Builder`) | Less boilerplate |

---

> **💡 Pro Tip:** During the interview, always start with what the feature IS, then explain HOW you implemented it in your project, and finally WHY you chose that approach. This shows depth.
