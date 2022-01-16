# Javascript promise defer library

# Install

```bash
yarn add jdefer
```

# Usage

```typescript
import makeDefer from 'jdefer'

const defer = makeDefer()

// to reject
defer.reject(new Error('foo'))

// to resolve
defer.resolve('bar')

// to wait
await defer.promise
```
