"use client";

import Swal from "sweetalert2";

function bindHoverPause(element: HTMLElement) {
  element.addEventListener("mouseenter", Swal.stopTimer);
  element.addEventListener("mouseleave", Swal.resumeTimer);
}

export const toast = {
  success(message: string) {
    void Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: message,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      didOpen: bindHoverPause,
    });
  },
  error(message: string) {
    void Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: message,
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      didOpen: bindHoverPause,
    });
  },
};

export async function confirmAction(message: string): Promise<boolean> {
  const result = await Swal.fire({
    icon: "warning",
    title: "Are you sure?",
    text: message,
    showCancelButton: true,
    confirmButtonText: "Yes, delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    reverseButtons: true,
    focusCancel: true,
  });

  return result.isConfirmed === true;
}
