print("Simple Calculator")

a = float(input("Enter first number: "))
b = float(input("Enter second number: "))

print("Choose operation: +, -, *, /")
op = input()

if op == "+":
    print("Result:", a + b)
elif op == "-":
    print("Result:", a - b)
elif op == "*":
    print("Result:", a * b)
elif op == "/":
    print("Result:", a / b)
else:
    print("Invalid operation")
