#!/bin/bash
echo "killing dev server"
input="ganacheID.txt"
while IFS= read -r line
do
  kill $line
done < "$input"
killall node
echo "dev server shutdown"