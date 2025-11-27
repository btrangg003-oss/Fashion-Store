# Review System Implementation Guide

## 🎯 Overview

Hướng dẫn chi tiết để implement hệ thống đánh giá chuyên nghiệp.

## ✅ Files Created

### 1. ImageUploadZone Component
**File:** `components/Profile/ImageUploadZone.tsx`

**Features:**
- Drag & drop support
- Multiple file selection
- Image preview với animation
- Delete individual images
- Upload progress
- Error handling
- Points hint

**Usage:**
```typescript
import { ImageUploadZone } from '@/components/Profile/ImageUploadZone';

<ImageUploadZone
  images={images}
  onImagesChange={setImages}
  maxImages={5}
  maxSizeMB={5}
/>
```

### 2. useImageUpload Hook
**File:** `hooks/useImageUpload.ts`

**Features:**
- State management for images
- Upload logic
- Validation
- Error handling

**Usage:**
```typescript
import { useImageUpload } from '@/hooks/useImageUpload';

const {
  images,
  uploading,
  error,
  addImages,
  removeImage,
  clearImages
} = useImageUpload([], 5, 5);
```

### 3. Points Calculator
**File:** `lib/pointsCalculator.ts`

**Functions:**
- `calculateReviewPoints()` - Calculate total points
- `getPointsMessage()` - Get detailed breakdown
- `getSimplePointsMessage()` - Get simple message

**Points Logic:**
```typescript
// Base points
- No photos: 30 points
- 1-2 photos: 40 points + 10 bonus
- 3+ photos: 70 points + 30 bonus

// Bonuses
- Review within 24h: +10 points
- Detailed review (>100 chars): +10 points
- First review ever: +20 points

// Total range: 30-150 points
```

## 🔧 Files to Update

### 1. ReviewForm.tsx

**Current Issues:**
- Using base64 for images
- No real-time sync
- No points notification

**Updates Needed:**

```typescript
// Add imports
import { ImageUploadZone } from './ImageUploadZone';
import { useImageUpload } from '@/hooks/useImageUpload';
import { calculateReviewPoints } from '@/lib/pointsCalculator';

// Replace image upload section
const {
  images,
  uploading: imageUploading,
  error: imageError,
  addImages,
  removeImage,
  clearImages
} = useImageUpload(review?.photos || [], 5, 5);

// In JSX, replace old photo upload with:
<ImageUploadZone
  images={images}
  onImagesChange={(newImages) => {
    // Update state
  }}
  maxImages={5}
  maxSizeMB={5}
/>

// After successful submit:
const response = await fetch('/api/reviews', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    orderId,
    productId,
    rating,
    title,
    comment,
    photos: images // Use uploaded images
  })
});

const data = await response.json();

// Show success with points
alert(`✅ Đánh giá thành công!\n🎉 Bạn nhận được +${data.pointsAwarded} điểm thưởng`);

// Refresh data
refreshReviews(); // From ProfileSyncContext
onClose(true);
```

### 2. pages/api/reviews/index.ts

**Add Points Calculation:**

```typescript
import { calculateReviewPoints } from '@/lib/pointsCalculator';

// In POST handler, after creating review:

// Get order to check delivery time
const order = await getOrderById(orderId);

// Check if first review
const userReviews = getUserReviews(userId);
const isFirstReview = userReviews.length === 0;

// Calculate points
const pointsBreakdown = calculateReviewPoints(
  photos?.length || 0,
  comment.length,
  order.deliveredAt || order.updatedAt,
  isFirstReview
);

const pointsAwarded = pointsBreakdown.totalPoints;

// Award points (existing code already does this)
// ... loyalty.json update
// ... auth.json update

// Return with points info
return res.status(201).json({
  message: 'Đánh giá thành công!',
  review,
  pointsAwarded,
  pointsBreakdown
});
```

### 3. ProfileSyncContext.tsx

**Add Review Refresh:**

```typescript
// Add to context
const [reviewsVersion, setReviewsVersion] = useState(0);

const refreshReviews = useCallback(() => {
  setReviewsVersion(v => v + 1);
}, []);

// Add to context value
return (
  <ProfileSyncContext.Provider value={{
    // ... existing values
    reviewsVersion,
    refreshReviews
  }}>
    {children}
  </ProfileSyncContext.Provider>
);
```

### 4. ReviewsTab.tsx

**Add Auto Refresh:**

```typescript
import { useProfileSync } from '@/contexts/ProfileSyncContext';

const { reviewsVersion, refreshReviews } = useProfileSync();

// Refetch when version changes
useEffect(() => {
  fetchReviews();
  fetchPending();
}, [reviewsVersion]);
```

### 5. ProductReviews.tsx

**Add Auto Refresh:**

```typescript
import { useProfileSync } from '@/contexts/ProfileSyncContext';

const { reviewsVersion } = useProfileSync();

// Refetch when version changes
useEffect(() => {
  fetchReviews();
}, [productId, reviewsVersion]);
```

## 🧪 Testing Steps

### 1. Test Image Upload
```
1. Open ReviewForm
2. Drag & drop an image
3. ✅ Image should upload and show preview
4. Click X to remove
5. ✅ Image should be removed
6. Try uploading > 5MB file
7. ✅ Should show error
8. Try uploading > 5 images
9. ✅ Should show error
```

### 2. Test Points Calculation
```
1. Submit review without photos
2. ✅ Should get +30 points
3. Submit review with 1 photo
4. ✅ Should get +50 points
5. Submit review with 3+ photos
6. ✅ Should get +100 points
7. Check loyalty.json
8. ✅ Points should be updated
```

### 3. Test Real-time Sync
```
1. Open Profile > Đánh giá
2. Submit a new review
3. ✅ Should appear in "Đã đánh giá" immediately
4. Go to product page
5. ✅ Review should appear immediately
6. No need to refresh page
```

### 4. Test Mobile
```
1. Open on mobile device
2. Test image upload
3. ✅ Should work smoothly
4. Test form submission
5. ✅ Should work correctly
```

## 📊 Success Metrics

### Performance
- Image upload: < 2s per image
- Form submission: < 1s
- Real-time sync: Immediate

### User Experience
- Clear error messages
- Loading states everywhere
- Success animations
- Points notification

### Data Integrity
- All reviews saved correctly
- Points calculated accurately
- Images uploaded successfully
- No data loss

## 🚀 Deployment Checklist

- [ ] All files created
- [ ] All files updated
- [ ] Tests passed
- [ ] Mobile tested
- [ ] Performance checked
- [ ] Error handling verified
- [ ] Documentation updated
- [ ] Ready for production

## 📝 Next Steps

1. Implement all file updates
2. Test thoroughly
3. Fix any bugs
4. Deploy to production
5. Monitor for issues
6. Gather user feedback

---

**Status:** Implementation Guide Complete
**Next:** Start Coding
