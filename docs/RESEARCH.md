# Technology Research

Research date: 2026-06-28

## Selected versions

| Technology         | Selected version | Rationale                                                                                           |
| ------------------ | ---------------: | --------------------------------------------------------------------------------------------------- |
| React / React DOM  |           19.2.7 | Current patched React 19.2 line; client-only Vite architecture does not use React Server Components |
| TypeScript         |            6.0.3 | Current stable compiler with strict project settings                                                |
| Vite               |            8.1.0 | Current stable Vite release and modern production bundler                                           |
| Node.js            |      24.18.0 LTS | Current LTS runtime used in CI and container builds                                                 |
| Playwright         |           1.61.1 | Current stable browser automation package                                                           |
| TanStack Query     |          5.101.2 | Mature remote-state, cancellation, polling, and retry control                                       |
| React Hook Form    |           7.80.0 | Efficient form-state ownership with accessible native inputs                                        |
| Zod                |            4.4.3 | Shared form validation and runtime API trust-boundary validation                                    |
| nginx-unprivileged |    1.30.2 Alpine | Current stable security-fixed nginx line, running without root                                      |

## Upgrade review

The release keeps the verified React 19.2, TypeScript 6, Vite 8, and Playwright generations. React type definitions were updated to `19.2.17`. ESLint remains on the current compatible 9.x line because the selected JSX accessibility plugin does not yet declare ESLint 10 compatibility; forcing that major would reduce confidence in the accessibility gate.

The production upgrade prioritizes bounded I/O, route splitting, accessibility automation, offline-aware query behavior, correlation, SBOM generation, and reverse-proxy correctness over unnecessary framework churn.

GitHub Actions were also moved to their current Node 24-based major generations: Checkout 7, Setup Node 6, Upload Artifact 7, Dependency Review 5, CodeQL 4, Docker Setup Buildx 4, and Docker Build Push 7.

## Architecture decisions

### Client-rendered React rather than a server framework

The backend already exposes a complete WebFlux API, and the requested frontend is an authenticated operations console rather than a public SEO site. A client-only Vite build keeps the deployment stateless and avoids adding a React Server Components attack surface.

### Same-origin reverse proxy

The production image proxies `/api` and `/actuator` to the backend. This avoids permissive CORS, keeps backend addressing out of the compiled bundle, and supports a future OIDC gateway or Backend-for-Frontend.

### Runtime schemas

TypeScript cannot verify network data at runtime. Zod schemas therefore protect every backend response before it enters React or TanStack Query state.

### TanStack Query

Remote job state has different lifecycle semantics from local UI state. Query caching, cancellation, bounded retry behavior, and terminal-state polling are centralized instead of recreated in page components.

### No browser token persistence

The reference backend does not define authentication. The project does not create a fake authentication layer or store bearer tokens in browser storage. Banking deployment should add identity at an OIDC gateway/BFF and enforce permissions server-side.

## Primary sources

- React 19.2: <https://react.dev/blog/2025/10/01/react-19-2>
- React security advisories: <https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components>
- TypeScript: <https://www.typescriptlang.org/>
- Vite releases: <https://vite.dev/blog/announcing-vite8>
- Node.js releases: <https://nodejs.org/en/about/previous-releases>
- Playwright: <https://playwright.dev/>
- Unprivileged nginx: <https://github.com/nginx/docker-nginx-unprivileged>
