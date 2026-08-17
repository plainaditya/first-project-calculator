from datetime import datetime

VALID_OPERATIONS = {"+", "-", "*", "/"}


def get_number(prompt):
    """Read a valid number, or return None when the user cancels with q."""
    while True:
        value = input(prompt).strip()

        if value.lower() == "q":
            return None

        try:
            return float(value)
        except ValueError:
            print("Invalid input. Enter a valid number or type 'q' to cancel.")


def get_operation():
    """Read and return a supported mathematical operation."""
    while True:
        operation = input("Operation (+, -, *, /): ").strip()

        if operation in VALID_OPERATIONS:
            return operation

        print("Invalid operation. Choose +, -, *, or /.")


def calculate(first_number, second_number, operation):
    """Perform a calculation and return the numeric result."""
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

    raise ValueError(f"Unsupported operation: {operation}")


def format_number(number):
    """Return a readable representation without unnecessary decimal zeros."""
    return f"{number:g}"


def show_history(history):
    """Display previous calculations in chronological order."""
    if not history:
        print("\nNo calculations have been recorded yet.\n")
        return

    print("\n--- Calculation History ---")
    for entry in history:
        print(entry)
    print("---------------------------\n")


def calculate_once(history):
    """Run one calculation and store the result in history."""
    print("\nEnter 'q' at any number prompt to return to the main menu.")

    first_number = get_number("First number: ")
    if first_number is None:
        return

    second_number = get_number("Second number: ")
    if second_number is None:
        return

    operation = get_operation()

    try:
        result = calculate(first_number, second_number, operation)
    except ZeroDivisionError as error:
        print(f"\nError: {error}\n")
        return

    expression = (
        f"{format_number(first_number)} {operation} "
        f"{format_number(second_number)} = {format_number(result)}"
    )

    timestamp = datetime.now().strftime("%H:%M:%S")
    history.append(f"[{timestamp}] {expression}")
    print(f"\nResult: {expression}\n")


def main():
    """Run the calculator menu until the user chooses to quit."""
    history = []

    print("=" * 36)
    print("          CALCULATOR")
    print("=" * 36)

    while True:
        print("[C] Calculate")
        print("[H] View history")
        print("[Q] Quit")

        choice = input("\nSelect an option: ").strip().lower()

        if choice == "c":
            calculate_once(history)
        elif choice == "h":
            show_history(history)
        elif choice == "q":
            print("\nCalculator closed. Goodbye.")
            break
        else:
            print("\nInvalid option. Choose C, H, or Q.\n")


if __name__ == "__main__":
    main()
