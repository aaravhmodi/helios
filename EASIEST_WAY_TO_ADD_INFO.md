# Easiest Way to Add Information - Step by Step

## 🎯 What You're Doing

You're adding text that HELIOS can use to answer questions. It's like adding entries to a dictionary.

---

## 📝 Example: Let's Add "Daily Food Production"

### Step 1: Open the File

Open: `app/lib/knowledge-base.ts`

### Step 2: Find Line 42 (the agriculture line)

You'll see this:

```typescript
agriculture: `Agricultural systems include: vertical hydroponic farms...`,
```

### Step 3: Add Your New Line RIGHT AFTER Line 42

Add this new line:

```typescript
agriculture: `Agricultural systems include: vertical hydroponic farms...`,
foodProduction: `We produce 1,000 kg of food per day. This includes vegetables, fruits, and protein.`,
healthcare: `Medical facilities include: surgical suites...`,
```

**See?** You just added `foodProduction` between `agriculture` and `healthcare`.

### Step 4: Find Line 189 (the food search line)

You'll see this:

```typescript
if (lowerQuery.includes('food') || lowerQuery.includes('agriculture') || lowerQuery.includes('farm') || lowerQuery.includes('grow')) {
  sections.push(`LIFE SUPPORT - Agriculture: ${HELIOS_KNOWLEDGE_BASE.lifeSupport.agriculture}`)
}
```

### Step 5: Add This RIGHT AFTER Line 191

Add this new block:

```typescript
if (lowerQuery.includes('food') || lowerQuery.includes('agriculture') || lowerQuery.includes('farm') || lowerQuery.includes('grow')) {
  sections.push(`LIFE SUPPORT - Agriculture: ${HELIOS_KNOWLEDGE_BASE.lifeSupport.agriculture}`)
}
if (lowerQuery.includes('food production') || lowerQuery.includes('daily production')) {
  sections.push(`FOOD PRODUCTION:\n${HELIOS_KNOWLEDGE_BASE.lifeSupport.foodProduction}`)
}
if (lowerQuery.includes('healthcare') || lowerQuery.includes('medical') || lowerQuery.includes('health')) {
```

**See?** You just added a new `if` statement between the food and healthcare checks.

### Step 6: Save and Restart

1. Press **Ctrl+S** to save
2. In terminal, press **Ctrl+C** to stop server
3. Type `npm run dev` and press Enter

### Step 7: Test It!

Go to dashboard → HELIOS Console → Ask: "What is food production?"

---

## 🎨 Visual Example

Here's what the file looks like BEFORE:

```typescript
lifeSupport: {
  agriculture: `Agricultural systems include...`,
  healthcare: `Medical facilities include...`,
}
```

Here's what it looks like AFTER (with your addition):

```typescript
lifeSupport: {
  agriculture: `Agricultural systems include...`,
  foodProduction: `We produce 1,000 kg of food per day.`,  // ← YOU ADDED THIS
  healthcare: `Medical facilities include...`,
}
```

---

## 💡 Quick Tips

1. **Always use backticks** `` ` `` not quotes `"` or `'`
2. **Add commas** between items
3. **Add the search part too** (the `if` statement) so HELIOS can find it
4. **Save and restart** the server after changes

---

## 🚀 Try This Right Now

1. Open `app/lib/knowledge-base.ts`
2. Go to line 42
3. Add this line after `agriculture`:
   ```typescript
   myTestInfo: `This is a test. If you see this, it worked!`,
   ```
4. Go to line 189
5. Add this after the food check:
   ```typescript
   if (lowerQuery.includes('test')) {
     sections.push(`TEST:\n${HELIOS_KNOWLEDGE_BASE.lifeSupport.myTestInfo}`)
   }
   ```
6. Save, restart, and ask HELIOS: "test"

If it works, you'll see "This is a test. If you see this, it worked!"

---

That's it! Just copy the pattern and add your own information. 🎉
