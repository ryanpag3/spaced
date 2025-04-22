
/**
 * expo-router requires a component to be available to render the tab button. 
 * 
 * We hijack that button and redirect to the actual submit screen instead inside of _layout.tsx
 */
export default function DummySubmit() {
    return null;
}