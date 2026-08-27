import pandas as pd

# Read the Excel dataset
data = pd.read_excel("data/gym recommendation.xlsx")

# print("FIRST 5 ROWS:")
# print(data.head())

# print("\nNUMBER OF ROWS AND COLUMNS:")
# print(data.shape)

# print("\nCOLUMN NAMES:")
# print(data.columns.tolist())




# features = [
#     "Sex",
#     "Age",
#     "Height",
#     "Weight",
#     "Hypertension",
#     "Diabetes",
#     "BMI",
#     "Level",
#     "Fitness Goal"
# ]

# X = data[features]

# y = data["Fitness Type"]

# print("\nFEATURES (X):")
# print(X.head())

# print("\nTARGET (y):")
# print(y.head())



# print("\nFITNESS TYPE VALUES:")
# print(data["Fitness Type"].value_counts())



print("\nFITNESS GOAL VS FITNESS TYPE:")

print(
    pd.crosstab(
        data["Fitness Goal"],
        data["Fitness Type"]
    )
)


print("\nFITNESS GOAL + LEVEL VS FITNESS TYPE:")

print(
    pd.crosstab(
        [
            data["Fitness Goal"],
            data["Level"]
        ],
        data["Fitness Type"]
    )
)