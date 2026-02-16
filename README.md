# BIND Playground

An interactive web application for exploring and building resources with the [BIND](https://bind-standard.org) (Business Insurance Normalized Data) standard.

**Live:** [playground.bind-standard.org](https://playground.bind-standard.org)

## What This Is

BIND Playground lets you explore the BIND standard hands-on — browse terminology code systems, build spec-compliant resources using auto-generated forms, and export complete bundles ready for integration.

It's built for anyone working with or evaluating the standard: developers, product teams, brokers, carriers, MGAs, and vendors.

## Features

### Terminology Browser

Search and browse 280+ standardized insurance code systems from the [BIND Terminology Server](https://bind.codes) — lines of business, coverage forms, peril types, construction classes, and more.

### Resource Builder

Create BIND resources using forms auto-generated from the standard's JSON schemas. Supports all resource types: Submissions, Policies, Claims, Coverages, Locations, Insureds, Organizations, and more.

### Bundle Viewer

View assembled BIND Bundles as JSON, copy to clipboard, or download. Bundles persist in your browser's local storage so you can build incrementally.

## Development

```bash
pnpm install
pnpm run dev          # dev server on port 3000
pnpm run build        # production build
pnpm run test         # run tests
pnpm run deploy       # build and deploy to Cloudflare
```

### Schema Sync

The playground auto-generates forms from JSON schemas synced from [bind-standard](https://github.com/bind-standard/bind-standard):

```bash
pnpm run sync:schemas
```

This runs automatically as part of `dev` and `build`.

### Stack

- [React](https://react.dev) + [TanStack Start](https://tanstack.com/start)
- [Mantine](https://mantine.dev) (UI components)
- [Cloudflare Workers](https://workers.cloudflare.com) (deployment)
- [@bind-insurance/sdk](https://github.com/bind-standard/bind-ts) (TypeScript SDK)

## Contributing

We welcome contributions from everyone. See [CONTRIBUTING.md](CONTRIBUTING.md) for details, or open a pull request directly.

For questions or ideas, reach out at **contact@bind-standard.org**.

## License

MIT. See [LICENSE](LICENSE).
