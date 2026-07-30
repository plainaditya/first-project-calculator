from datetime import datetime


def get_number(prompt):
    """Keep asking until the user enters a valid number or quits."""
    while True:
        value = input(prompt).strip()

        if value.lower() == "q":
            return None

        try:
            return float(value)
        except ValueError:
            print("Invalid input. Enter a valid number or type 'q' to cancel.")


def get_operation():
    """Return a valid mathematical operation."""
    valid_operations = {"+", "-", "*", "/"}

    while True:
        operation = input("Operation (+, -, *, /): ").strip()

        if operation in valid_operations:
            return operation

        print("Invalid operation. Please choose +, -, *, or /.")


def calculate(first_number, second_number, operation):
    """Perform the selected calculation."""
    if operation == "+":
        return first_number + second_number

    if operation == "-":
        return first_number - second_number

    if operation == "*":
        return first_number * second_number

    if operation == "/":
        if second_number == 0:
            raise ZeroDivisionError("Cannot divide by zero.")
        return first_number / second_number


def format_number(number):
    """Remove unnecessary decimal zeros."""
    return f"{number:g}"


def show_history(history):
    """Display all previous calculations."""
    if not history:
        print("\nNo calculations have been made yet.\n")
        return

    print("\n--- Calculation History ---")
    for calculation in history:
        print(calculation)
    print("---------------------------\n")


def main():
    history = []

    print("=" * 36)
    print("        SIMPLE CALCULATOR")
    print("=" * 36)

    while True:
        print("\n[C] Calculate")
        print("[H] View history")
        print("[Q] Quit")

        choice = input("\nChoose an option: ").strip().lower()

        if choice == "q":
            print("\nThanks for using the calculator!")
            break

        if choice == "h":
            show_history(history)
            continue

        if choice != "c":
            print("Invalid choice. Please select C, H, or Q.")
            continue

        print("\nType 'q' while entering a number to return to the menu.")

        first_number = get_number("Enter first number: ")
        if first_number is None:
            continue

        second_number = get_number("Enter second number: ")
        if second_number is None:
            continue

        operation = get_operation()

        try:
            result = calculate(first_number, second_number, operation)

            expression = (
                f"{format_number(first_number)} {operation} "
                f"{format_number(second_number)} = {format_number(result)}"
            )

            time = datetime.now().strftime("%H:%M:%S")
            history.append(f"[{time}] {expression}")

            print(f"\nResult: {expression}")

        except ZeroDivisionError as error:
            print(f"\nError: {error}")


if __name__ == "__main__":
    main()
