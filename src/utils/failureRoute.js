const FALLBACK_ERROR_MESSAGE = 'Some unexpected error occured. Please try again later or Contact the Dev.';

export const createFailurePath = (cause, attemptedUrl) => {
  const currentUrl = attemptedUrl || window.location.href;
  const params = new URLSearchParams({
    url: currentUrl,
    cause: cause || FALLBACK_ERROR_MESSAGE,
  });

  return `/load-error?${params.toString()}`;
};

export { FALLBACK_ERROR_MESSAGE };
