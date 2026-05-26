# Admin Components Migration - Remaining Work

The following components still need to be updated to use cookie-based authentication:

## Components to Update

1. **EventsView.tsx** - Multiple fetch calls (submit, upload photo, toggle, delete)
2. **GalleryPhotosView.tsx** - Multiple fetch calls
3. **BoardMembersView.tsx** - Multiple fetch calls  
4. **HonoreesView.tsx** - Multiple fetch calls

## Pattern to Replace

**OLD:**
```typescript
const password = sessionStorage.getItem('admin_password');
if (!password) {
  // error handling
  return;
}

const response = await fetch('/api/admin/...', {
  headers: {
    'x-admin-password': password,
    // other headers
  },
});
```

**NEW:**
```typescript
const response = await fetch('/api/admin/...', {
  credentials: 'include', // Include HttpOnly cookie for session validation
  headers: {
    // other headers (no password header)
  },
});

if (!response.ok) {
  if (response.status === 401 || response.status === 403) {
    window.location.href = '/admin';
    return;
  }
  // other error handling
}
```

## Status

✅ **Completed:**
- DashboardView.tsx
- MembersView.tsx (fetchMembers, handleSave)
- PaymentsView.tsx (fetchPayments)
- EventsView.tsx (fetchEvents, handleSubmit)

⏳ **Remaining:**
- EventsView.tsx (handlePhotoUpload, handleToggleActive, handleDelete)
- GalleryPhotosView.tsx (all fetch calls)
- BoardMembersView.tsx (all fetch calls)
- HonoreesView.tsx (all fetch calls)

