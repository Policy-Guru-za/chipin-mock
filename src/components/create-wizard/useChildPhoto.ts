import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type RefObject,
} from 'react';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export interface UseChildPhotoReturn {
  inputRef: RefObject<HTMLInputElement | null>;
  previewObjectUrl: string | null;
  errorMessage: string | null;
  hasPreview: boolean;
  displayExistingPhoto: boolean;
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (event: DragEvent<HTMLElement>) => void;
  openFilePicker: () => void;
}

export function useChildPhoto(existingPhotoUrl: string | null): UseChildPhotoReturn {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updatePreviewObjectUrl = useCallback((nextUrl: string | null) => {
    setPreviewObjectUrl((currentUrl) => {
      if (currentUrl && currentUrl !== nextUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return nextUrl;
    });
  }, []);

  useEffect(
    () => () => {
      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
      }
    },
    [previewObjectUrl],
  );

  const assignFileToInput = useCallback((file: File) => {
    if (!inputRef.current) {
      return;
    }

    try {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      inputRef.current.files = dataTransfer.files;
    } catch {
      inputRef.current.value = '';
    }
  }, []);

  const applyFile = useCallback(
    (file: File | null, shouldSyncInput: boolean) => {
      if (!file) {
        if (shouldSyncInput && inputRef.current) {
          inputRef.current.value = '';
        }
        setErrorMessage(null);
        updatePreviewObjectUrl(null);
        return;
      }

      if (!ACCEPTED_MIME_TYPES.has(file.type)) {
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        setErrorMessage('Photos must be JPG, PNG, or WebP.');
        updatePreviewObjectUrl(null);
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        setErrorMessage('Photo must be under 5MB');
        updatePreviewObjectUrl(null);
        return;
      }

      if (shouldSyncInput) {
        assignFileToInput(file);
      }

      setErrorMessage(null);
      updatePreviewObjectUrl(URL.createObjectURL(file));
    },
    [assignFileToInput, updatePreviewObjectUrl],
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      applyFile(event.currentTarget.files?.[0] ?? null, false);
    },
    [applyFile],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      const droppedFile = event.dataTransfer.files?.[0] ?? null;
      applyFile(droppedFile, true);
    },
    [applyFile],
  );

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const displayExistingPhoto = !previewObjectUrl && Boolean(existingPhotoUrl);
  const hasPreview = Boolean(previewObjectUrl || existingPhotoUrl);

  return {
    inputRef,
    previewObjectUrl,
    errorMessage,
    hasPreview,
    displayExistingPhoto,
    handleInputChange,
    handleDrop,
    openFilePicker,
  };
}
