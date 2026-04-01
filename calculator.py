print("Simple Calculator")

while True:
    try:
        a = float(input("Enter first number: "))
        b = float(input("Enter second number: "))
    except:
        print("Invalid input. Please enter numbers.")
        continue

    print("Choose operation: +, -, *, /")
    op = input()

    if op == "+":
        print("Result:", a + b)
    elif op == "-":
        print("Result:", a - b)
    elif op == "*":
        print("Result:", a * b)
    elif op == "/":
        if b != 0:
            print("Result:", a / b)
        else:
            print("Cannot divide by zero")
    else:
        print("Invalid operation")

    again = input("Do you want to calculate again? (yes/no): ")
    if again.lower() != "yes":
        break
