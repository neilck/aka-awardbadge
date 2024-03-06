"use server";

export async function create(formData: FormData) {
  "use server";
  console.log("create log should be show in server console");
  const id = "1234";
}

export async function greaterThan10(value: number) {
  "use server";
  console.log("greaterThan10 log should be show in server console");
  return value > 10;
}
