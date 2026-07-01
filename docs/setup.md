# Setup Guide

## 1. Create Repositories

Create two repositories:

- `kerala-tiffins-app`: public app shell for GitHub Pages.
- `kerala-tiffins-data`: private JSON data store.

Copy `data-template/` into the private data repository.

## 2. Create a Fine-Grained Token

Create a GitHub fine-grained token with access only to the private data repository. Grant Contents read/write if the user will save data. Kitchen-only users should use read-only access where practical.

## 3. Open the App

Run locally with `pnpm dev` or deploy to GitHub Pages. On first run, enter:

- Data repo owner
- Data repo name
- Branch
- Token

The app shell must not contain real customer data or secrets.
