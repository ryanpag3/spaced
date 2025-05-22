# Spaced

## API Documentation

### Pagination

The Spaced API uses cursor-based pagination for listing posts and other content. Cursor-based pagination provides the following benefits:

- Better performance for large datasets
- Consistent results even when items are added or removed
- Prevents skipping items when using "load more" functionality

#### How to use pagination

When making a request to endpoints that support pagination (such as `/posts`), you can include the following query parameters:

- `size`: Number of items to return per page (default: 20)
- `nextPageToken`: Cursor token for the next page of results

Example request:
```
GET /posts?feedType=profile&size=10&nextPageToken=post-123
```

The response will include:

```json
{
  "posts": [...],
  "nextPageToken": "post-456",
  "total": 100
}
```

To fetch the next page, use the `nextPageToken` value from the previous response:

```
GET /posts?feedType=profile&size=10&nextPageToken=post-456
```

When there are no more results, the `nextPageToken` field will be omitted from the response.

Stay tuned for more documentation!